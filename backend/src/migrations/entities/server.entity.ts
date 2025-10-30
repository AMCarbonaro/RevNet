import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Channel } from './channel.entity';

export enum ServerType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  COMMUNITY = 'community'
}

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  banner: string;

  @Column({
    type: 'enum',
    enum: ServerType,
    default: ServerType.PRIVATE
  })
  type: ServerType;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  memberCount: number;

  @Column({ default: 0 })
  onlineCount: number;

  @Column({ nullable: true })
  inviteCode: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  ownerId: string;

  // Relations
  @OneToMany(() => Channel, channel => channel.server)
  channels: Channel[];
}
