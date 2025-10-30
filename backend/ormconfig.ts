import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    'src/modules/revnet/entities/server.entity.ts',
    'src/modules/revnet/entities/channel.entity.ts',
    'src/modules/revnet/entities/message.entity.ts',
    'src/modules/revnet/entities/dm-channel.entity.ts',
    'src/modules/auth/entities/user.entity.ts'
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});
