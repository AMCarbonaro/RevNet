import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from '../../auth/entities/user.entity';

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

  // Relations
  @OneToMany(() => Channel, channel => channel.server)
  channels: Channel[];

  // @ManyToMany(() => User, user => user.servers)
  // @JoinTable({
  //   name: 'server_members',
  //   joinColumn: { name: 'serverId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  // })
  // members: User[];

  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: false })
  isDiscoverable: boolean;

  @Column({ nullable: true, length: 200 })
  shortDescription: string;

  @Column({ default: 0 })
  messageCount: number;

  // @ManyToMany(() => User, user => user.ownedServers)
  // @JoinTable({
  //   name: 'server_owners',
  //   joinColumn: { name: 'serverId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  // })
  // owners: User[];
}
