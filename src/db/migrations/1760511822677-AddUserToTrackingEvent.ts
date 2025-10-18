import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserToTrackingEvent1760511822677 implements MigrationInterface {
    name = 'AddUserToTrackingEvent1760511822677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking_events" RENAME COLUMN "createdBy" TO "createdById"`);
        await queryRunner.query(`ALTER TABLE "tracking_events" ADD CONSTRAINT "FK_e85a5c135c8fbfec3bde781d94c" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracking_events" DROP CONSTRAINT "FK_e85a5c135c8fbfec3bde781d94c"`);
        await queryRunner.query(`ALTER TABLE "tracking_events" RENAME COLUMN "createdById" TO "createdBy"`);
    }

}
