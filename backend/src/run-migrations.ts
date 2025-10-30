import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
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
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
});

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set, skipping migrations');
    return;
  }

  try {
    console.log('🔄 Running database migrations...');
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigrations();

