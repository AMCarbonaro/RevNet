import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query, UseGuards } from '@nestjs/common';
import { ServersService } from '../services/servers.service';
import { CreateServerDto } from '../dto/create-server.dto';
import { UpdateServerDto } from '../dto/update-server.dto';
import { ServerDiscoveryQueryDto } from '../dto/server-discovery-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/revnet/servers')
@UseGuards(JwtAuthGuard)
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  create(@Body() createServerDto: CreateServerDto, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.create(createServerDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.findAll(userId);
  }

  // IMPORTANT: Specific routes like 'discover' must come BEFORE parameterized routes like ':id'
  // Otherwise NestJS will match '/discover' as ':id' = 'discover'
  // This route should never be hit since ServerDiscoveryController handles it, but adding for safety
  @Get('discover')
  discoverConflict() {
    throw new Error('Route conflict: use /api/revnet/servers/discover endpoint instead');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.update(id, updateServerDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.remove(id, userId);
  }

  @Post('join')
  joinServer(@Body('inviteCode') inviteCode: string, @Request() req) {
    const userId = req.user?.id || 'user1'; // Fallback to mock user for now
    return this.serversService.joinServer(inviteCode, userId);
  }

  // Member management
  @Get(':id/members')
  getMembers(@Param('id') serverId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.getMembers(serverId, userId);
  }

  @Post(':id/members')
  addMember(@Param('id') serverId: string, @Body('userId') memberId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.addMember(serverId, memberId, userId);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') serverId: string, @Param('memberId') memberId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.removeMember(serverId, memberId, userId);
  }

  @Post(':id/members/:memberId/kick')
  kickMember(@Param('id') serverId: string, @Param('memberId') memberId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.kickMember(serverId, memberId, userId);
  }

  @Post(':id/members/:memberId/ban')
  banMember(@Param('id') serverId: string, @Param('memberId') memberId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.banMember(serverId, memberId, userId);
  }

  // Role management
  @Get(':id/roles')
  getRoles(@Param('id') serverId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.getRoles(serverId, userId);
  }

  @Post(':id/roles')
  createRole(@Param('id') serverId: string, @Body() roleData: any, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.createRole(serverId, roleData, userId);
  }

  @Patch(':id/roles/:roleId')
  updateRole(@Param('id') serverId: string, @Param('roleId') roleId: string, @Body() roleData: any, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.updateRole(serverId, roleId, roleData, userId);
  }

  @Delete(':id/roles/:roleId')
  deleteRole(@Param('id') serverId: string, @Param('roleId') roleId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.deleteRole(serverId, roleId, userId);
  }

  // Invite management
  @Get(':id/invites')
  getInvites(@Param('id') serverId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.getInvites(serverId, userId);
  }

  @Post(':id/invites')
  createInvite(@Param('id') serverId: string, @Body() inviteData: any, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.createInvite(serverId, inviteData, userId);
  }

  @Delete(':id/invites/:inviteId')
  revokeInvite(@Param('id') serverId: string, @Param('inviteId') inviteId: string, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.revokeInvite(serverId, inviteId, userId);
  }

  // Discovery settings (authenticated)
  @Patch(':id/discovery')
  updateDiscoverySettings(@Param('id') serverId: string, @Body() discoveryData: any, @Request() req) {
    const userId = req.user?.id || 'user1';
    return this.serversService.updateDiscoverySettings(serverId, discoveryData, userId);
  }
}
