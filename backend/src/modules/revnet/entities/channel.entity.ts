import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Server } from './server.entity';
import { Message } from './message.entity';

export enum ChannelType {
  TEXT = 0,
  DM = 1,
  VOICE = 2,
  GROUP_DM = 3,
  CATEGORY = 4,
  NEWS = 5,
  STORE = 6,
  NEWS_THREAD = 10,
  PUBLIC_THREAD = 11,
  PRIVATE_THREAD = 12,
  STAGE_VOICE = 13,
  DIRECTORY = 14,
  FORUM = 15
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ChannelType,
    default: ChannelType.TEXT
  })
  type: ChannelType;

  @Column({ nullable: true })
  topic: string;

  @Column({ default: false })
  nsfw: boolean;

  @Column({ default: 0 })
  position: number;

  @Column({ nullable: true })
  bitrate: number;

  @Column({ nullable: true })
  userLimit: number;

  @Column({ default: 0 })
  rateLimitPerUser: number;

  @Column({ nullable: true })
  lastMessageId: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Server, server => server.channels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serverId' })
  server: Server;

  @Column({ nullable: true })
  serverId: string | null;

  @OneToMany(() => Message, message => message.channel)
  messages: Message[];

  @ManyToOne(() => Channel, channel => channel.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Channel;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Channel, channel => channel.parent)
  children: Channel[];
}
