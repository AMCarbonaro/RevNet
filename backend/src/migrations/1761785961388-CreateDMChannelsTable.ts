import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDMChannelsTable1761785961388 implements MigrationInterface {
    name = 'CreateDMChannelsTable1761785961388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "dm_channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channelId" uuid NOT NULL, "recipientIds" json NOT NULL, "name" character varying, "isGroup" boolean NOT NULL DEFAULT false, "isClosed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_80956f5d232a5637af4186d77d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "dm_channels" ADD CONSTRAINT "FK_86378e6d496505e431051343b1c" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dm_channels" DROP CONSTRAINT "FK_86378e6d496505e431051343b1c"`);
        await queryRunner.query(`DROP TABLE "dm_channels"`);
    }

}
