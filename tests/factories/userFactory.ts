import { User } from '@/types';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    const defaultUser: User = {
      _id: Math.random().toString(36).substr(2, 9),
      name: 'Test User',
      email: 'test@example.com',
      userType: 'user',
      isBanned: false,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      profilePicture: null,
      bio: 'Test user bio',
      location: 'Test Location',
      website: 'https://example.com',
      socialLinks: {},
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        privacyMode: false
      }
    };

    return { ...defaultUser, ...overrides };
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      userType: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      ...overrides
    });
  }

  static createModerator(overrides: Partial<User> = {}): User {
    return this.create({
      userType: 'moderator',
      name: 'Moderator User',
      email: 'moderator@example.com',
      ...overrides
    });
  }

  static createBanned(overrides: Partial<User> = {}): User {
    return this.create({
      isBanned: true,
      name: 'Banned User',
      email: 'banned@example.com',
      ...overrides
    });
  }

  static createUnverified(overrides: Partial<User> = {}): User {
    return this.create({
      emailVerified: false,
      name: 'Unverified User',
      email: 'unverified@example.com',
      ...overrides
    });
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        name: `Test User ${index + 1}`,
        email: `test${index + 1}@example.com`,
        ...overrides
      })
    );
  }
}
