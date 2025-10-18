import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialDatabase1760505175987 implements MigrationInterface {
    name = 'CreateInitialDatabase1760505175987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'CONTENT_MANAGER', 'SALES', 'OPS')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "fullName" character varying, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'OPS', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "service_translations" ("id" SERIAL NOT NULL, "locale" character varying(10) NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "shortDesc" text, "content" text, "serviceId" integer, CONSTRAINT "UQ_6b3a815de34f494a06c499fb110" UNIQUE ("slug"), CONSTRAINT "PK_887292540272908992d43b2145b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2e8169100182bde484a93de4b0" ON "service_translations" ("serviceId", "locale") `);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "code" character varying(50) NOT NULL, "category" character varying(50) NOT NULL, "coverImage" character varying, "featured" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f019a17cb439406ab185382df9b" UNIQUE ("code"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quotes" ("id" SERIAL NOT NULL, "customerName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "details" text NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "aiSuggestedPrice" double precision, "adminNotes" text, "serviceId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_99a0e8bcbcd8719d3a41f23c263" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "news_translations" ("id" SERIAL NOT NULL, "locale" character varying(10) NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "excerpt" text NOT NULL, "content" text NOT NULL, "newsId" integer, CONSTRAINT "UQ_736380dde48a2824ba9ad403c94" UNIQUE ("slug"), CONSTRAINT "PK_aa28099d8337dedcf1fb7537bbc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_61d66ec2f70db536bbabf07a1d" ON "news_translations" ("newsId", "locale") `);
        await queryRunner.query(`CREATE TYPE "public"."news_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`);
        await queryRunner.query(`CREATE TABLE "news" ("id" SERIAL NOT NULL, "coverImage" character varying, "featured" boolean NOT NULL DEFAULT false, "status" "public"."news_status_enum" NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "consignments" ("id" SERIAL NOT NULL, "awb" character varying(100) NOT NULL, "customerId" integer, "origin" character varying(255) NOT NULL, "destination" character varying(255) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "estimatedDeliveryDate" TIMESTAMP, "aiPredictedEta" double precision, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_90b8bf4ec3744a7a8ea990fe53a" UNIQUE ("awb"), CONSTRAINT "PK_ac4a3e322938f3ea03ee389f7c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_90b8bf4ec3744a7a8ea990fe53" ON "consignments" ("awb") `);
        await queryRunner.query(`CREATE TABLE "tracking_events" ("id" SERIAL NOT NULL, "eventCode" character varying(50) NOT NULL, "description" text NOT NULL, "eventTime" TIMESTAMP NOT NULL DEFAULT now(), "location" character varying, "geo" point, "createdBy" integer, "consignmentId" integer, CONSTRAINT "PK_cc22ae68e05d9ba5a6575a6f429" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8931fd891e87895b9ee6fcc608" ON "tracking_events" ("consignmentId", "eventTime") `);
        await queryRunner.query(`CREATE TABLE "job_applications" ("id" SERIAL NOT NULL, "applicantName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(50) NOT NULL, "coverLetter" text, "cvPath" character varying NOT NULL, "appliedAt" TIMESTAMP NOT NULL DEFAULT now(), "jobPostingId" integer, CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_postings_status_enum" AS ENUM('OPEN', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "job_postings" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "location" character varying(100) NOT NULL, "description" text NOT NULL, "requirements" text NOT NULL, "status" "public"."job_postings_status_enum" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dda635ece382c8ad2d90a179182" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_translations" ADD CONSTRAINT "FK_779fb10af2736831c70689f0782" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quotes" ADD CONSTRAINT "FK_086c0115f07a90ceba51d010469" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news_translations" ADD CONSTRAINT "FK_ca59c8d30f65353cd1cbec37c1c" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tracking_events" ADD CONSTRAINT "FK_62cb69bfda33fd481c18667e103" FOREIGN KEY ("consignmentId") REFERENCES "consignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_applications" ADD CONSTRAINT "FK_ec9063a093d5b9e2d57d98ccfbb" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_ec9063a093d5b9e2d57d98ccfbb"`);
        await queryRunner.query(`ALTER TABLE "tracking_events" DROP CONSTRAINT "FK_62cb69bfda33fd481c18667e103"`);
        await queryRunner.query(`ALTER TABLE "news_translations" DROP CONSTRAINT "FK_ca59c8d30f65353cd1cbec37c1c"`);
        await queryRunner.query(`ALTER TABLE "quotes" DROP CONSTRAINT "FK_086c0115f07a90ceba51d010469"`);
        await queryRunner.query(`ALTER TABLE "service_translations" DROP CONSTRAINT "FK_779fb10af2736831c70689f0782"`);
        await queryRunner.query(`DROP TABLE "job_postings"`);
        await queryRunner.query(`DROP TYPE "public"."job_postings_status_enum"`);
        await queryRunner.query(`DROP TABLE "job_applications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8931fd891e87895b9ee6fcc608"`);
        await queryRunner.query(`DROP TABLE "tracking_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90b8bf4ec3744a7a8ea990fe53"`);
        await queryRunner.query(`DROP TABLE "consignments"`);
        await queryRunner.query(`DROP TABLE "news"`);
        await queryRunner.query(`DROP TYPE "public"."news_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61d66ec2f70db536bbabf07a1d"`);
        await queryRunner.query(`DROP TABLE "news_translations"`);
        await queryRunner.query(`DROP TABLE "quotes"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2e8169100182bde484a93de4b0"`);
        await queryRunner.query(`DROP TABLE "service_translations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
