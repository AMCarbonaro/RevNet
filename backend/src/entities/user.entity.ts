import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  discriminator: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({
    type: 'enum',
    enum: ['online', 'away', 'busy', 'invisible'],
    default: 'online'
  })
  status: 'online' | 'away' | 'busy' | 'invisible';

  @Column({ nullable: true })
  customStatus?: string;

  @Column('json')
  letterProgress: {
    completedLetters: number[];
    currentLetter: number;
    totalLetters: number;
    canAccessDiscord: boolean;
    assignments: any[];
  };

  @Column('json', { default: '[]' })
  revoltMemberships: string[];

  @Column({ default: false })
  hasSeenWelcome: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastActive: Date;
}
