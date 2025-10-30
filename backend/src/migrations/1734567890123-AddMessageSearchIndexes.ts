import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageSearchIndexes1734567890123 implements MigrationInterface {
  name = 'AddMessageSearchIndexes1734567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm extension for fuzzy text search
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // Add GIN index on message content for fast ILIKE searches
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_content_gin" ON "message" USING gin ("content" gin_trgm_ops);`);

    // Add indexes for common search filters
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_channel_id" ON "message" ("channelId");`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_author_id" ON "message" ("authorId");`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_created_at" ON "message" ("createdAt");`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_is_active" ON "message" ("isActive");`);

    // Add composite index for common search patterns
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_message_search_composite" ON "message" ("isActive", "channelId", "createdAt") WHERE "isActive" = true;`);

    // Add indexes for server discovery
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_server_is_discoverable" ON "server" ("isDiscoverable") WHERE "isDiscoverable" = true;`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_server_category" ON "server" ("category");`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_server_member_count" ON "server" ("memberCount");`);
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_server_message_count" ON "server" ("messageCount");`);

    // Add GIN index for server tags array
    await queryRunner.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_server_tags_gin" ON "server" USING gin ("tags");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_server_tags_gin";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_server_message_count";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_server_member_count";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_server_category";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_server_is_discoverable";`);
    
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_search_composite";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_is_active";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_created_at";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_author_id";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_channel_id";`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS "IDX_message_content_gin";`);

    // Note: We don't drop the pg_trgm extension as it might be used by other parts of the application
  }
}
