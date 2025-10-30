import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { Message } from './message.entity';

@Entity('dm_channels')
export class DMChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  channelId: string;

  @Column('json')
  recipientIds: string[];

  @Column({ nullable: true })
  name: string; // For group DMs

  @Column({ default: false })
  isGroup: boolean;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel: Channel;

  @OneToMany(() => Message, message => message.channel)
  messages: Message[];
}
