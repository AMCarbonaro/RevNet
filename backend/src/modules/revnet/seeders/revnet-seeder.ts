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

    // Create sample servers - Revolt themed
    const server1Result = await this.serverRepository.insert({
      name: 'Climate Action Now',
      description: 'Mobilizing communities to combat climate change through direct action, policy advocacy, and sustainable living. Join the movement demanding real environmental justice.',
      shortDescription: 'Fighting climate change through direct action and policy change',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 1200,
      onlineCount: 45,
      category: 'climate',
      tags: ['environment', 'activism', 'sustainability', 'climate-justice'],
      isDiscoverable: true,
    });
    const server1 = await this.serverRepository.findOne({ where: { id: server1Result.identifiers[0].id } });
    if (!server1) throw new Error('Failed to create server1');

    const server2Result = await this.serverRepository.insert({
      name: 'Digital Privacy Rights',
      description: 'Protecting digital freedoms and fighting surveillance capitalism. We organize against data harvesting, advocate for encryption rights, and build tools for true online privacy.',
      shortDescription: 'Fighting for digital privacy and freedom from surveillance',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 856,
      onlineCount: 23,
      category: 'tech',
      tags: ['privacy', 'technology', 'encryption', 'digital-rights'],
      isDiscoverable: true,
    });
    const server2 = await this.serverRepository.findOne({ where: { id: server2Result.identifiers[0].id } });
    if (!server2) throw new Error('Failed to create server2');

    const server3Result = await this.serverRepository.insert({
      name: 'Housing Justice Collective',
      description: 'Organizing tenants against predatory landlords and fighting for affordable housing as a human right. We coordinate rent strikes, lobby for tenant protections, and build community power.',
      shortDescription: 'Fighting for affordable housing and tenant rights',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 2100,
      onlineCount: 67,
      category: 'social',
      tags: ['housing', 'tenants-rights', 'affordable-housing', 'community'],
      isDiscoverable: true,
    });
    const server3 = await this.serverRepository.findOne({ where: { id: server3Result.identifiers[0].id } });
    if (!server3) throw new Error('Failed to create server3');

    const server4Result = await this.serverRepository.insert({
      name: 'Worker Power Union',
      description: 'Empowering workers to organize, unionize, and demand fair wages and working conditions. We share organizing strategies, support labor actions, and build solidarity across industries.',
      shortDescription: 'Organizing workers and fighting for labor rights',
      icon: undefined,
      ownerId: 'user1',
      type: ServerType.PUBLIC,
      memberCount: 1845,
      onlineCount: 92,
      category: 'social',
      tags: ['labor', 'union', 'workers-rights', 'organizing'],
      isDiscoverable: true,
    });
    const server4 = await this.serverRepository.findOne({ where: { id: server4Result.identifiers[0].id } });
    if (!server4) throw new Error('Failed to create server4');

    // Create sample channels for server1 (Climate Action Now)
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

    // Create sample channels for server2 (Digital Privacy Rights)
    const privacyGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server2.id,
      position: 0,
      isActive: true,
    });
    const privacyGeneralChannel = await this.channelRepository.findOne({ where: { id: privacyGeneralChannelResult.identifiers[0].id } });
    if (!privacyGeneralChannel) throw new Error('Failed to create privacyGeneralChannel');

    const privacyVoiceChannelResult = await this.channelRepository.insert({
      name: 'voice-chat',
      type: 2,
      serverId: server2.id,
      position: 1,
      isActive: true,
    });
    const privacyVoiceChannel = await this.channelRepository.findOne({ where: { id: privacyVoiceChannelResult.identifiers[0].id } });
    if (!privacyVoiceChannel) throw new Error('Failed to create privacyVoiceChannel');

    // Create sample channels for server3 (Housing Justice Collective)
    const housingGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server3.id,
      position: 0,
      isActive: true,
    });
    const housingGeneralChannel = await this.channelRepository.findOne({ where: { id: housingGeneralChannelResult.identifiers[0].id } });
    if (!housingGeneralChannel) throw new Error('Failed to create housingGeneralChannel');

    const housingVoiceChannelResult = await this.channelRepository.insert({
      name: 'voice-chat',
      type: 2,
      serverId: server3.id,
      position: 1,
      isActive: true,
    });
    const housingVoiceChannel = await this.channelRepository.findOne({ where: { id: housingVoiceChannelResult.identifiers[0].id } });
    if (!housingVoiceChannel) throw new Error('Failed to create housingVoiceChannel');

    // Create sample channels for server4 (Worker Power Union)
    const workerGeneralChannelResult = await this.channelRepository.insert({
      name: 'general',
      type: 0,
      serverId: server4.id,
      position: 0,
      isActive: true,
    });
    const workerGeneralChannel = await this.channelRepository.findOne({ where: { id: workerGeneralChannelResult.identifiers[0].id } });
    if (!workerGeneralChannel) throw new Error('Failed to create workerGeneralChannel');

    const workerAnnouncementsChannelResult = await this.channelRepository.insert({
      name: 'announcements',
      type: 0,
      serverId: server4.id,
      position: 1,
      isActive: true,
    });
    const workerAnnouncementsChannel = await this.channelRepository.findOne({ where: { id: workerAnnouncementsChannelResult.identifiers[0].id } });
    if (!workerAnnouncementsChannel) throw new Error('Failed to create workerAnnouncementsChannel');

    const workerVoiceChannelResult = await this.channelRepository.insert({
      name: 'voice-chat',
      type: 2,
      serverId: server4.id,
      position: 2,
      isActive: true,
    });
    const workerVoiceChannel = await this.channelRepository.findOne({ where: { id: workerVoiceChannelResult.identifiers[0].id } });
    if (!workerVoiceChannel) throw new Error('Failed to create workerVoiceChannel');

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
      content: '🌍 **Welcome to Climate Action Now!**\n\nThis is where we organize for real environmental change. Join the movement!',
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
        
        // Add basic channels for all revolt servers
        await this.channelRepository.insert({
          name: 'general',
          type: 0,
          serverId: server.id,
          position: 0,
          isActive: true,
        });
        
        // Add announcements channel for public revolts
        if (server.type === ServerType.PUBLIC) {
          await this.channelRepository.insert({
            name: 'announcements',
            type: 0,
            serverId: server.id,
            position: 1,
            isActive: true,
          });
          await this.channelRepository.insert({
            name: 'voice-chat',
            type: 2,
            serverId: server.id,
            position: 2,
            isActive: true,
          });
        } else {
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
