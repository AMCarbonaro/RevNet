import { MigrationInterface, QueryRunner, Table, Index, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRevNetTables1700000000000 implements MigrationInterface {
  name = 'CreateRevNetTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create servers table
    await queryRunner.createTable(
      new Table({
        name: 'servers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'banner',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['public', 'private', 'community'],
            default: "'private'",
          },
          {
            name: 'verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'memberCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'onlineCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'inviteCode',
            type: 'varchar',
            length: '6',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'ownerId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create channels table
    await queryRunner.createTable(
      new Table({
        name: 'channels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'int',
            default: 0,
          },
          {
            name: 'topic',
            type: 'varchar',
            length: '1024',
            isNullable: true,
          },
          {
            name: 'nsfw',
            type: 'boolean',
            default: false,
          },
          {
            name: 'position',
            type: 'int',
            default: 0,
          },
          {
            name: 'bitrate',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'userLimit',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rateLimitPerUser',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastMessageId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'serverId',
            type: 'uuid',
          },
          {
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'type',
            type: 'int',
            default: 0,
          },
          {
            name: 'tts',
            type: 'boolean',
            default: false,
          },
          {
            name: 'mentionEveryone',
            type: 'boolean',
            default: false,
          },
          {
            name: 'pinned',
            type: 'boolean',
            default: false,
          },
          {
            name: 'nonce',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'webhookId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'flags',
            type: 'int',
            default: 0,
          },
          {
            name: 'editedTimestamp',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'channelId',
            type: 'uuid',
          },
          {
            name: 'authorId',
            type: 'uuid',
          },
          {
            name: 'referencedMessageId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create server_members junction table
    await queryRunner.createTable(
      new Table({
        name: 'server_members',
        columns: [
          {
            name: 'serverId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create server_owners junction table
    await queryRunner.createTable(
      new Table({
        name: 'server_owners',
        columns: [
          {
            name: 'serverId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'channels',
      new TableForeignKey({
        columnNames: ['serverId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'servers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'channels',
      new TableForeignKey({
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['channelId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['referencedMessageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'messages',
        onDelete: 'SET NULL',
      }),
    );

    // Add indexes for performance
    await queryRunner.createIndex('servers', new TableIndex({
      name: 'IDX_SERVERS_INVITE_CODE',
      columnNames: ['inviteCode']
    }));
    await queryRunner.createIndex('channels', new TableIndex({
      name: 'IDX_CHANNELS_SERVER_ID',
      columnNames: ['serverId']
    }));
    await queryRunner.createIndex('channels', new TableIndex({
      name: 'IDX_CHANNELS_POSITION',
      columnNames: ['serverId', 'position']
    }));
    await queryRunner.createIndex('messages', new TableIndex({
      name: 'IDX_MESSAGES_CHANNEL_ID',
      columnNames: ['channelId']
    }));
    await queryRunner.createIndex('messages', new TableIndex({
      name: 'IDX_MESSAGES_CREATED_AT',
      columnNames: ['channelId', 'createdAt']
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const channelsTable = await queryRunner.getTable('channels');
    const messagesTable = await queryRunner.getTable('messages');
    
    if (channelsTable) {
      const serverFk = channelsTable.foreignKeys.find(fk => fk.columnNames.includes('serverId'));
      if (serverFk) {
        await queryRunner.dropForeignKey('channels', serverFk);
      }
      
      const parentFk = channelsTable.foreignKeys.find(fk => fk.columnNames.includes('parentId'));
      if (parentFk) {
        await queryRunner.dropForeignKey('channels', parentFk);
      }
    }

    if (messagesTable) {
      const channelFk = messagesTable.foreignKeys.find(fk => fk.columnNames.includes('channelId'));
      if (channelFk) {
        await queryRunner.dropForeignKey('messages', channelFk);
      }
      
      const referencedFk = messagesTable.foreignKeys.find(fk => fk.columnNames.includes('referencedMessageId'));
      if (referencedFk) {
        await queryRunner.dropForeignKey('messages', referencedFk);
      }
    }

    // Drop tables
    await queryRunner.dropTable('server_owners');
    await queryRunner.dropTable('server_members');
    await queryRunner.dropTable('messages');
    await queryRunner.dropTable('channels');
    await queryRunner.dropTable('servers');
  }
}
