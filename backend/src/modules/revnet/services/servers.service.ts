import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Server } from '../entities/server.entity';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { ServerDiscoveryQueryDto, ServerSortBy } from '../dto/server-discovery-query.dto';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private serversRepository: Repository<Server>,
  ) {}

  async create(createServerDto: CreateServerDto, userId: string): Promise<Server> {
    const server = this.serversRepository.create({
      ...createServerDto,
      ownerId: userId,
      memberCount: 1,
      onlineCount: 1,
      inviteCode: this.generateInviteCode(),
    });

    return await this.serversRepository.save(server);
  }

  async findAll(userId: string): Promise<Server[]> {
    return await this.serversRepository
      .createQueryBuilder('server')
      .leftJoinAndSelect('server.channels', 'channel')
      .where('server.ownerId = :userId', { userId })
      .orderBy('server.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Server> {
    const server = await this.serversRepository
      .createQueryBuilder('server')
      .leftJoinAndSelect('server.channels', 'channel')
      .where('server.id = :id', { id })
      .andWhere('server.ownerId = :userId', { userId })
      .getOne();

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    return server;
  }

  async update(id: string, updateServerDto: UpdateServerDto, userId: string): Promise<Server> {
    const server = await this.findOne(id, userId);
    
    // Check if user is owner
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can update server settings');
    }

    Object.assign(server, updateServerDto);
    return await this.serversRepository.save(server);
  }

  async remove(id: string, userId: string): Promise<void> {
    const server = await this.findOne(id, userId);
    
    // Check if user is owner
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can delete servers');
    }

    await this.serversRepository.remove(server);
  }

  async joinServer(inviteCode: string, userId: string): Promise<Server> {
    const server = await this.serversRepository.findOne({
      where: { inviteCode },
    });

    if (!server) {
      throw new NotFoundException('Invalid invite code');
    }

    // For now, just return the server
    // Note: Proper member management would require user entity setup
    return server;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Member management methods
  async getMembers(serverId: string, userId: string): Promise<any[]> {
    const server = await this.findOne(serverId, userId);
    
    // Mock member data - in real app, this would query the members table
    return [
      { id: '1', username: 'CurrentUser', status: 'online', isOwner: true, isAdmin: false },
      { id: '2', username: 'TestUser', status: 'away', isOwner: false, isAdmin: true },
      { id: '3', username: 'Member1', status: 'online', isOwner: false, isAdmin: false },
      { id: '4', username: 'Member2', status: 'offline', isOwner: false, isAdmin: false }
    ];
  }

  async addMember(serverId: string, memberId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can add members');
    }

    // Mock implementation - in real app, this would add to members table
    return { success: true, message: 'Member added successfully' };
  }

  async removeMember(serverId: string, memberId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can remove members');
    }

    // Mock implementation
    return { success: true, message: 'Member removed successfully' };
  }

  async kickMember(serverId: string, memberId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can kick members');
    }

    // Mock implementation
    return { success: true, message: 'Member kicked successfully' };
  }

  async banMember(serverId: string, memberId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can ban members');
    }

    // Mock implementation
    return { success: true, message: 'Member banned successfully' };
  }

  // Role management methods
  async getRoles(serverId: string, userId: string): Promise<any[]> {
    const server = await this.findOne(serverId, userId);
    
    // Mock role data
    return [
      { id: '1', name: 'Owner', color: '#7289da', memberCount: 1 },
      { id: '2', name: 'Admin', color: '#f04747', memberCount: 1 },
      { id: '3', name: 'Moderator', color: '#faa61a', memberCount: 0 },
      { id: '4', name: 'Member', color: '#99aab5', memberCount: 2 }
    ];
  }

  async createRole(serverId: string, roleData: any, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can create roles');
    }

    // Mock implementation
    return { success: true, message: 'Role created successfully', role: { id: Date.now().toString(), ...roleData } };
  }

  async updateRole(serverId: string, roleId: string, roleData: any, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can update roles');
    }

    // Mock implementation
    return { success: true, message: 'Role updated successfully' };
  }

  async deleteRole(serverId: string, roleId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can delete roles');
    }

    // Mock implementation
    return { success: true, message: 'Role deleted successfully' };
  }

  // Invite management methods
  async getInvites(serverId: string, userId: string): Promise<any[]> {
    const server = await this.findOne(serverId, userId);
    
    // Mock invite data
    return [
      { id: '1', code: 'abc123', creator: 'CurrentUser', uses: 5, maxUses: 100 },
      { id: '2', code: 'def456', creator: 'TestUser', uses: 0, maxUses: null }
    ];
  }

  async createInvite(serverId: string, inviteData: any, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can create invites');
    }

    // Mock implementation
    const inviteCode = this.generateInviteCode();
    return { success: true, message: 'Invite created successfully', invite: { id: Date.now().toString(), code: inviteCode, ...inviteData } };
  }

  async revokeInvite(serverId: string, inviteId: string, userId: string): Promise<any> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can revoke invites');
    }

    // Mock implementation
    return { success: true, message: 'Invite revoked successfully' };
  }

  // Discovery methods
  async findPublicServers(query: ServerDiscoveryQueryDto): Promise<{ servers: Server[], total: number, page: number, totalPages: number }> {
    try {
      const { search, category, tags, sortBy, page = 1, limit = 20 } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.serversRepository
        .createQueryBuilder('server')
        .leftJoinAndSelect('server.channels', 'channel')
        .where('server.isDiscoverable = :discoverable', { discoverable: true })
        .andWhere('server.isActive = :active', { active: true });

      // Search filter
      if (search) {
        queryBuilder.andWhere(
          '(server.name ILIKE :search OR server.description ILIKE :search OR server.shortDescription ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Category filter
      if (category) {
        queryBuilder.andWhere('server.category = :category', { category });
      }

      // Tags filter - for simple-array type, check if any tag exists in comma-separated string
      if (tags && tags.length > 0) {
        const tagConditions = tags.map((tag, index) => {
          const paramName = `tag${index}`;
          queryBuilder.setParameter(paramName, `%,${tag},%`);
          return `server.tags LIKE :${paramName}`;
        });
        // Also check for tags at start or end of string
        const tagConditionsStartEnd = tags.map((tag, index) => {
          const paramNameStart = `tagStart${index}`;
          const paramNameEnd = `tagEnd${index}`;
          queryBuilder.setParameter(paramNameStart, `${tag},%`);
          queryBuilder.setParameter(paramNameEnd, `%,${tag}`);
          return `(server.tags LIKE :${paramNameStart} OR server.tags LIKE :${paramNameEnd})`;
        });
        const allConditions = [...tagConditions, ...tagConditionsStartEnd];
        queryBuilder.andWhere(`(${allConditions.join(' OR ')})`);
      }

      // Sort by
      switch (sortBy) {
        case ServerSortBy.POPULAR:
          queryBuilder.orderBy('server.memberCount', 'DESC');
          break;
        case ServerSortBy.RECENT:
          queryBuilder.orderBy('server.createdAt', 'DESC');
          break;
        case ServerSortBy.ACTIVE:
          queryBuilder.orderBy('server.messageCount', 'DESC');
          break;
        default:
          queryBuilder.orderBy('server.memberCount', 'DESC');
      }

      // Pagination
      queryBuilder.skip(skip).take(limit);

      const [servers, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        servers,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('[ServersService] Error in findPublicServers:', error);
      console.error('[ServersService] Query:', query);
      console.error('[ServersService] Error stack:', error.stack);
      throw error;
    }
  }

  async searchServers(query: ServerDiscoveryQueryDto): Promise<{ servers: Server[], total: number, page: number, totalPages: number }> {
    return this.findPublicServers(query);
  }

  async getServersByCategory(category: string): Promise<Server[]> {
    return this.serversRepository.find({
      where: {
        category,
        isDiscoverable: true,
        isActive: true
      },
      order: { memberCount: 'DESC' }
    });
  }

  async getServersByTags(tags: string[]): Promise<Server[]> {
    return this.serversRepository
      .createQueryBuilder('server')
      .where('server.isDiscoverable = :discoverable', { discoverable: true })
      .andWhere('server.isActive = :active', { active: true })
      .andWhere('server.tags && :tags', { tags })
      .orderBy('server.memberCount', 'DESC')
      .getMany();
  }

  async getCategories(): Promise<string[]> {
    const result = await this.serversRepository
      .createQueryBuilder('server')
      .select('DISTINCT server.category', 'category')
      .where('server.category IS NOT NULL')
      .andWhere('server.isDiscoverable = :discoverable', { discoverable: true })
      .andWhere('server.isActive = :active', { active: true })
      .getRawMany();

    return result.map(r => r.category).filter(Boolean);
  }

  async getPopularTags(limit: number = 20): Promise<string[]> {
    // This is a simplified version - in production you'd want a more sophisticated tag counting
    const servers = await this.serversRepository.find({
      where: {
        isDiscoverable: true,
        isActive: true
      },
      select: ['tags']
    });

    const tagCounts = new Map<string, number>();
    servers.forEach(server => {
      if (server.tags) {
        server.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  async updateDiscoverySettings(serverId: string, discoveryData: Partial<Pick<Server, 'isDiscoverable' | 'category' | 'tags' | 'shortDescription'>>, userId: string): Promise<Server> {
    const server = await this.findOne(serverId, userId);
    
    // Check permissions
    if (server.ownerId !== userId) {
      throw new ForbiddenException('Only server owners can update discovery settings');
    }

    Object.assign(server, discoveryData);
    return await this.serversRepository.save(server);
  }
}
