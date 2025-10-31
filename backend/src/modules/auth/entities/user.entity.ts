import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Server } from '../../revnet/entities/server.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: '0000' })
  discriminator: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'online' })
  status: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  accentColor: number;

  @Column({ default: 'en-US' })
  locale: string;

  @Column({ default: 0 })
  flags: number;

  @Column({ default: 0 })
  premiumType: number;

  @Column({ default: 0 })
  publicFlags: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  letterProgress: {
    completedLetters: number[];
    currentLetter: number;
    totalLetters: number;
    canAccessDiscord: boolean;
    assignments: any[];
  };

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  revoltMemberships: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  // Relations
  // @ManyToMany(() => Server, server => server.members)
  // @JoinTable({
  //   name: 'server_members',
  //   joinColumn: { name: 'userId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'serverId', referencedColumnName: 'id' }
  // })
  // servers: Server[];

  // @ManyToMany(() => Server, server => server.owners)
  // @JoinTable({
  //   name: 'server_owners',
  //   joinColumn: { name: 'userId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'serverId', referencedColumnName: 'id' }
  // })
  // ownedServers: Server[];
}
