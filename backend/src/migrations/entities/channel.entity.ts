import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Server } from './server.entity';
import { Message } from './message.entity';

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  type: number;

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

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  serverId: string;

  @Column({ nullable: true })
  parentId: string;

  // Relations
  @ManyToOne(() => Server, server => server.channels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serverId' })
  server: Server;

  @OneToMany(() => Message, message => message.channel)
  messages: Message[];
}
