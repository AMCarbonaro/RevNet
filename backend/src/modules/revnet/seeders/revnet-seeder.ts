import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, ServerType } from '../entities/server.entity';
import { Channel } from '../entities/channel.entity';
import { Message } from '../entities/message.entity';

@Injectable()
export class RevNetSeeder {
  constructor(
    @InjectRepository(Server)
    private serverRepository: Repository<Server>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async seed(): Promise<void> {
    // Check if data already exists
    const existingServers = await this.serverRepository.count();
    if (existingServers > 0) {
      console.log('Sample data already exists, updating channels to active...');
      // Update existing channels to be active
      await this.channelRepository.update({ isActive: false }, { isActive: true });
      console.log('Channels updated to active');
      
      // Check if we need to add channels to servers that don't have any
      await this.ensureAllServersHaveChannels();
      return;
    }

    // Create sample servers
    const server1Result = await this.serverRepository.insert({
      name: 'HackerSpace',
      description: 'A place for hackers and developers',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 1200,
      onlineCount: 45,
    });
    const server1 = await this.serverRepository.findOne({ where: { id: server1Result.identifiers[0].id } });
    if (!server1) throw new Error('Failed to create server1');

    const server2Result = await this.serverRepository.insert({
      name: 'GameStation',
      description: 'Gaming community',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 856,
      onlineCount: 23,
    });
    const server2 = await this.serverRepository.findOne({ where: { id: server2Result.identifiers[0].id } });
    if (!server2) throw new Error('Failed to create server2');

    const server3Result = await this.serverRepository.insert({
      name: 'DevTeam',
      description: 'Development team workspace',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PRIVATE,
      memberCount: 12,
      onlineCount: 8,
    });
    const server3 = await this.serverRepository.findOne({ where: { id: server3Result.identifiers[0].id } });
    if (!server3) throw new Error('Failed to create server3');

    const server4Result = await this.serverRepository.insert({
      name: 'ArtClub',
      description: 'Creative arts community',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 2100,
      onlineCount: 67,
    });
    const server4 = await this.serverRepository.findOne({ where: { id: server4Result.identifiers[0].id } });
    if (!server4) throw new Error('Failed to create server4');

    // Create sample channels for server1 (HackerSpace)
    const generalChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0, // Text channel
      serverId: server1.id,
      position: 0,
      isActive: true,
    });
    const generalChannel = await this.channelRepository.findOne({ where: { id: generalChannelResult.identifiers[0].id } });
    if (!generalChannel) throw new Error('Failed to create generalChannel');

    const announcementsChannelResult = await this.channelRepository.insert({
      name: 'announcements',
      type: 0, // Text channel
      serverId: server1.id,
      position: 1,
      isActive: true,
    });
    const announcementsChannel = await this.channelRepository.findOne({ where: { id: announcementsChannelResult.identifiers[0].id } });
    if (!announcementsChannel) throw new Error('Failed to create announcementsChannel');

    const randomChannelResult = await this.channelRepository.insert({
      name: 'random',
      type: 0, // Text channel
      serverId: server1.id,
      position: 2,
      isActive: true,
    });
    const randomChannel = await this.channelRepository.findOne({ where: { id: randomChannelResult.identifiers[0].id } });
    if (!randomChannel) throw new Error('Failed to create randomChannel');

    const voiceChannelResult = await this.channelRepository.insert({
      name: 'voice-chat',
      type: 2, // Voice channel
      serverId: server1.id,
      position: 3,
      isActive: true,
    });
    const voiceChannel = await this.channelRepository.findOne({ where: { id: voiceChannelResult.identifiers[0].id } });
    if (!voiceChannel) throw new Error('Failed to create voiceChannel');

    // Create sample channels for server2 (GameStation)
    const gameGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server2.id,
      position: 0,
      isActive: true,
    });
    const gameGeneralChannel = await this.channelRepository.findOne({ where: { id: gameGeneralChannelResult.identifiers[0].id } });
    if (!gameGeneralChannel) throw new Error('Failed to create gameGeneralChannel');

    const gameVoiceChannelResult = await this.channelRepository.insert({
      name: 'gaming-voice',
      type: 2,
      serverId: server2.id,
      position: 1,
      isActive: true,
    });
    const gameVoiceChannel = await this.channelRepository.findOne({ where: { id: gameVoiceChannelResult.identifiers[0].id } });
    if (!gameVoiceChannel) throw new Error('Failed to create gameVoiceChannel');

    // Create sample channels for server3 (DevTeam)
    const devGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server3.id,
      position: 0,
      isActive: true,
    });
    const devGeneralChannel = await this.channelRepository.findOne({ where: { id: devGeneralChannelResult.identifiers[0].id } });
    if (!devGeneralChannel) throw new Error('Failed to create devGeneralChannel');

    const devVoiceChannelResult = await this.channelRepository.insert({
      name: 'dev-voice',
      type: 2,
      serverId: server3.id,
      position: 1,
      isActive: true,
    });
    const devVoiceChannel = await this.channelRepository.findOne({ where: { id: devVoiceChannelResult.identifiers[0].id } });
    if (!devVoiceChannel) throw new Error('Failed to create devVoiceChannel');

    // Create sample channels for server4 (ArtClub)
    const artGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server4.id,
      position: 0,
      isActive: true,
    });
    const artGeneralChannel = await this.channelRepository.findOne({ where: { id: artGeneralChannelResult.identifiers[0].id } });
    if (!artGeneralChannel) throw new Error('Failed to create artGeneralChannel');

    const artShowcaseChannelResult = await this.channelRepository.insert({
      name: 'showcase',
      type: 0,
      serverId: server4.id,
      position: 1,
      isActive: true,
    });
    const artShowcaseChannel = await this.channelRepository.findOne({ where: { id: artShowcaseChannelResult.identifiers[0].id } });
    if (!artShowcaseChannel) throw new Error('Failed to create artShowcaseChannel');

    const artVoiceChannelResult = await this.channelRepository.insert({
      name: 'art-voice',
      type: 2,
      serverId: server4.id,
      position: 2,
      isActive: true,
    });
    const artVoiceChannel = await this.channelRepository.findOne({ where: { id: artVoiceChannelResult.identifiers[0].id } });
    if (!artVoiceChannel) throw new Error('Failed to create artVoiceChannel');

    // Create sample messages for general channel
    await this.messageRepository.insert({
      content: 'Hey everyone! How is everyone doing today?',
      channelId: generalChannel.id,
      authorId: 'user1',
      type: 0,
    });

    await this.messageRepository.insert({
      content: 'Pretty good! Just working on some **cool projects**. How about you?',
      channelId: generalChannel.id,
      authorId: 'user2',
      type: 0,
    });

    await this.messageRepository.insert({
      content: 'Same here! The new features look amazing\n```javascript\nconsole.log("hello world")\n```',
      channelId: generalChannel.id,
      authorId: 'user1',
      type: 0,
    });

    // Create sample messages for announcements
    await this.messageRepository.insert({
      content: '🚀 **Welcome to HackerSpace!**\n\nThis is our main development server. Feel free to introduce yourself!',
      channelId: announcementsChannel.id,
      authorId: 'user1',
      type: 0,
    });

    // Create sample messages for random channel
    await this.messageRepository.insert({
      content: 'Anyone up for a coding challenge? 🧑‍💻',
      channelId: randomChannel.id,
      authorId: 'user3',
      type: 0,
    });

    await this.messageRepository.insert({
      content: 'I\'m in! What kind of challenge?',
      channelId: randomChannel.id,
      authorId: 'user2',
      type: 0,
    });

    console.log('RevNet sample data seeded successfully!');
    console.log(`Created ${await this.serverRepository.count()} servers`);
    console.log(`Created ${await this.channelRepository.count()} channels`);
    console.log(`Created ${await this.messageRepository.count()} messages`);
  }

  private async ensureAllServersHaveChannels(): Promise<void> {
    const servers = await this.serverRepository.find();
    
    for (const server of servers) {
      const channelCount = await this.channelRepository.count({ where: { serverId: server.id } });
      
      if (channelCount === 0) {
        console.log(`Adding channels to server: ${server.name}`);
        
        // Add basic channels based on server name
        if (server.name === 'DevTeam') {
          await this.channelRepository.insert({
            name: 'general',
            type: 0,
            serverId: server.id,
            position: 0,
            isActive: true,
          });
          await this.channelRepository.insert({
            name: 'dev-voice',
            type: 2,
            serverId: server.id,
            position: 1,
            isActive: true,
          });
        } else if (server.name === 'ArtClub') {
          await this.channelRepository.insert({
            name: 'general',
            type: 0,
            serverId: server.id,
            position: 0,
            isActive: true,
          });
          await this.channelRepository.insert({
            name: 'showcase',
            type: 0,
            serverId: server.id,
            position: 1,
            isActive: true,
          });
          await this.channelRepository.insert({
            name: 'art-voice',
            type: 2,
            serverId: server.id,
            position: 2,
            isActive: true,
          });
        } else {
          // Generic channels for any other servers
          await this.channelRepository.insert({
            name: 'general',
            type: 0,
            serverId: server.id,
            position: 0,
            isActive: true,
          });
          await this.channelRepository.insert({
            name: 'voice-chat',
            type: 2,
            serverId: server.id,
            position: 1,
            isActive: true,
          });
        }
      }
    }
  }
}
