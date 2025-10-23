// Role-Based Access Control (RBAC) system for Revolution Network

export type UserRole = 'admin' | 'moderator' | 'creator' | 'supporter';
export type Permission = 
  | 'users.read' | 'users.write' | 'users.delete'
  | 'projects.read' | 'projects.write' | 'projects.delete' | 'projects.moderate'
  | 'letters.read' | 'letters.write' | 'letters.delete'
  | 'donations.read' | 'donations.write' | 'donations.delete'
  | 'admin.dashboard' | 'admin.system' | 'admin.audit'
  | 'moderation.content' | 'moderation.users'
  | 'analytics.read' | 'analytics.write'
  | 'settings.read' | 'settings.write';

export interface Role {
  name: UserRole;
  permissions: Permission[];
  description: string;
}

export interface UserPermissions {
  userId: string;
  roles: UserRole[];
  permissions: Permission[];
  isActive: boolean;
  expiresAt?: Date;
}

// Define roles and their permissions
export const ROLES: Record<UserRole, Role> = {
  admin: {
    name: 'admin',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'projects.read', 'projects.write', 'projects.delete', 'projects.moderate',
      'letters.read', 'letters.write', 'letters.delete',
      'donations.read', 'donations.write', 'donations.delete',
      'admin.dashboard', 'admin.system', 'admin.audit',
      'moderation.content', 'moderation.users',
      'analytics.read', 'analytics.write',
      'settings.read', 'settings.write'
    ],
    description: 'Full system access with all permissions'
  },
  
  moderator: {
    name: 'moderator',
    permissions: [
      'users.read', 'users.write',
      'projects.read', 'projects.write', 'projects.moderate',
      'letters.read', 'letters.write',
      'donations.read',
      'moderation.content', 'moderation.users',
      'analytics.read'
    ],
    description: 'Content moderation and user management permissions'
  },
  
  creator: {
    name: 'creator',
    permissions: [
      'projects.read', 'projects.write',
      'letters.read',
      'donations.read'
    ],
    description: 'Can create and manage projects, read letters'
  },
  
  supporter: {
    name: 'supporter',
    permissions: [
      'projects.read',
      'letters.read',
      'donations.read'
    ],
    description: 'Basic read-only access to projects and letters'
  }
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: ['users.read', 'users.write', 'users.delete'],
  PROJECT_MANAGEMENT: ['projects.read', 'projects.write', 'projects.delete', 'projects.moderate'],
  LETTER_MANAGEMENT: ['letters.read', 'letters.write', 'letters.delete'],
  DONATION_MANAGEMENT: ['donations.read', 'donations.write', 'donations.delete'],
  ADMIN_ACCESS: ['admin.dashboard', 'admin.system', 'admin.audit'],
  MODERATION: ['moderation.content', 'moderation.users'],
  ANALYTICS: ['analytics.read', 'analytics.write'],
  SETTINGS: ['settings.read', 'settings.write']
};

// RBAC Manager class
export class RBACManager {
  private userPermissions: Map<string, UserPermissions> = new Map();

  constructor() {
    // Initialize with default permissions
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions() {
    // This would typically load from database
    // For now, we'll use in-memory storage
  }

  // Check if user has specific permission
  hasPermission(userId: string, permission: Permission): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms || !userPerms.isActive) {
      return false;
    }

    // Check if permission has expired
    if (userPerms.expiresAt && userPerms.expiresAt < new Date()) {
      return false;
    }

    return userPerms.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userId, permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userId, permission));
  }

  // Check if user has specific role
  hasRole(userId: string, role: UserRole): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms || !userPerms.isActive) {
      return false;
    }

    return userPerms.roles.includes(role);
  }

  // Check if user has any of the specified roles
  hasAnyRole(userId: string, roles: UserRole[]): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms || !userPerms.isActive) {
      return false;
    }

    return roles.some(role => userPerms.roles.includes(role));
  }

  // Assign role to user
  assignRole(userId: string, role: UserRole, expiresAt?: Date): void {
    const userPerms = this.userPermissions.get(userId) || {
      userId,
      roles: [],
      permissions: [],
      isActive: true
    };

    if (!userPerms.roles.includes(role)) {
      userPerms.roles.push(role);
      
      // Add role permissions
      const rolePermissions = ROLES[role].permissions;
      rolePermissions.forEach(permission => {
        if (!userPerms.permissions.includes(permission)) {
          userPerms.permissions.push(permission);
        }
      });
    }

    if (expiresAt) {
      userPerms.expiresAt = expiresAt;
    }

    this.userPermissions.set(userId, userPerms);
  }

  // Remove role from user
  removeRole(userId: string, role: UserRole): void {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return;

    userPerms.roles = userPerms.roles.filter(r => r !== role);
    
    // Recalculate permissions based on remaining roles
    userPerms.permissions = [];
    userPerms.roles.forEach(roleName => {
      const rolePermissions = ROLES[roleName].permissions;
      rolePermissions.forEach(permission => {
        if (!userPerms.permissions.includes(permission)) {
          userPerms.permissions.push(permission);
        }
      });
    });

    this.userPermissions.set(userId, userPerms);
  }

  // Grant specific permission to user
  grantPermission(userId: string, permission: Permission, expiresAt?: Date): void {
    const userPerms = this.userPermissions.get(userId) || {
      userId,
      roles: [],
      permissions: [],
      isActive: true
    };

    if (!userPerms.permissions.includes(permission)) {
      userPerms.permissions.push(permission);
    }

    if (expiresAt) {
      userPerms.expiresAt = expiresAt;
    }

    this.userPermissions.set(userId, userPerms);
  }

  // Revoke specific permission from user
  revokePermission(userId: string, permission: Permission): void {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return;

    userPerms.permissions = userPerms.permissions.filter(p => p !== permission);
    this.userPermissions.set(userId, userPerms);
  }

  // Get user's permissions
  getUserPermissions(userId: string): UserPermissions | null {
    return this.userPermissions.get(userId) || null;
  }

  // Get user's roles
  getUserRoles(userId: string): UserRole[] {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? userPerms.roles : [];
  }

  // Check if user is admin
  isAdmin(userId: string): boolean {
    return this.hasRole(userId, 'admin');
  }

  // Check if user is moderator
  isModerator(userId: string): boolean {
    return this.hasRole(userId, 'moderator');
  }

  // Check if user can moderate content
  canModerateContent(userId: string): boolean {
    return this.hasPermission(userId, 'moderation.content');
  }

  // Check if user can manage users
  canManageUsers(userId: string): boolean {
    return this.hasAnyPermission(userId, ['users.write', 'users.delete']);
  }

  // Check if user can access admin dashboard
  canAccessAdmin(userId: string): boolean {
    return this.hasPermission(userId, 'admin.dashboard');
  }

  // Check if user can view analytics
  canViewAnalytics(userId: string): boolean {
    return this.hasPermission(userId, 'analytics.read');
  }

  // Check if user can manage settings
  canManageSettings(userId: string): boolean {
    return this.hasPermission(userId, 'settings.write');
  }

  // Get all users with specific role
  getUsersWithRole(role: UserRole): string[] {
    const users: string[] = [];
    this.userPermissions.forEach((userPerms, userId) => {
      if (userPerms.isActive && userPerms.roles.includes(role)) {
        users.push(userId);
      }
    });
    return users;
  }

  // Get all users with specific permission
  getUsersWithPermission(permission: Permission): string[] {
    const users: string[] = [];
    this.userPermissions.forEach((userPerms, userId) => {
      if (userPerms.isActive && userPerms.permissions.includes(permission)) {
        users.push(userId);
      }
    });
    return users;
  }

  // Deactivate user permissions
  deactivateUser(userId: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (userPerms) {
      userPerms.isActive = false;
      this.userPermissions.set(userId, userPerms);
    }
  }

  // Activate user permissions
  activateUser(userId: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (userPerms) {
      userPerms.isActive = true;
      this.userPermissions.set(userId, userPerms);
    }
  }

  // Get permission hierarchy (for UI display)
  getPermissionHierarchy(): Record<string, Permission[]> {
    return PERMISSION_GROUPS;
  }

  // Validate permission string
  isValidPermission(permission: string): permission is Permission {
    const allPermissions = Object.values(ROLES).flatMap(role => role.permissions);
    return allPermissions.includes(permission as Permission);
  }

  // Validate role string
  isValidRole(role: string): role is UserRole {
    return role in ROLES;
  }
}

// Create singleton instance
export const rbacManager = new RBACManager();

// Utility functions
export const checkPermission = (userId: string, permission: Permission): boolean => {
  return rbacManager.hasPermission(userId, permission);
};

export const checkRole = (userId: string, role: UserRole): boolean => {
  return rbacManager.hasRole(userId, role);
};

export const requirePermission = (userId: string, permission: Permission): void => {
  if (!rbacManager.hasPermission(userId, permission)) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
};

export const requireRole = (userId: string, role: UserRole): void => {
  if (!rbacManager.hasRole(userId, role)) {
    throw new Error(`Insufficient role: ${role} required`);
  }
};

export const requireAnyPermission = (userId: string, permissions: Permission[]): void => {
  if (!rbacManager.hasAnyPermission(userId, permissions)) {
    throw new Error(`Insufficient permissions: one of ${permissions.join(', ')} required`);
  }
};

export const requireAnyRole = (userId: string, roles: UserRole[]): void => {
  if (!rbacManager.hasAnyRole(userId, roles)) {
    throw new Error(`Insufficient role: one of ${roles.join(', ')} required`);
  }
};

// Middleware for API routes
export const withPermission = (permission: Permission) => {
  return (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      requirePermission(userId, permission);
      next();
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  };
};

export const withRole = (role: UserRole) => {
  return (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      requireRole(userId, role);
      next();
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  };
};

export const withAnyPermission = (permissions: Permission[]) => {
  return (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      requireAnyPermission(userId, permissions);
      next();
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  };
};

export const withAnyRole = (roles: UserRole[]) => {
  return (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      requireAnyRole(userId, roles);
      next();
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  };
};

export default rbacManager;
