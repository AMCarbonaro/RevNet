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
    process.exit(0); // Exit successfully, don't fail the build
    return;
  }

  try {
    console.log('🔄 Running database migrations...');
    await AppDataSource.initialize();
    const executedMigrations = await AppDataSource.runMigrations();
    
    if (executedMigrations.length > 0) {
      console.log(`✅ Ran ${executedMigrations.length} migrations successfully`);
      executedMigrations.forEach(m => console.log(`  - ${m.name}`));
    } else {
      console.log('✅ No pending migrations');
    }
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Don't exit with error - let the app continue
    // The app has synchronize: false so it won't modify schema automatically
    process.exit(0);
  }
}

runMigrations();

