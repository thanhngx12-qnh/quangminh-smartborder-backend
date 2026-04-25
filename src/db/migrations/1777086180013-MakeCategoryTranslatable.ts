import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCategoryTranslatable1776585000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tạo bảng category_translations
        await queryRunner.query(`
            CREATE TABLE "category_translations" (
                "id" SERIAL PRIMARY KEY,
                "locale" varchar(10) NOT NULL,
                "name" varchar NOT NULL,
                "slug" varchar NOT NULL,
                "description" text,
                "categoryId" integer,
                CONSTRAINT "FK_category_translation" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE
            )
        `);

        // 2. Tạo Index cho [categoryId, locale]
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_category_locale" ON "category_translations" ("categoryId", "locale")`);

        // 3. CHUYỂN DỮ LIỆU CŨ SANG BẢNG DỊCH (Mặc định là tiếng Việt 'vi')
        await queryRunner.query(`
            INSERT INTO "category_translations" ("locale", "name", "slug", "description", "categoryId")
            SELECT 'vi', "name", "slug", "description", "id" FROM "categories"
        `);

        // 4. XÓA CÁC CỘT CŨ Ở BẢNG CATEGORIES
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback (Sẽ thêm lại các cột và chuyển ngược data - có thể bỏ qua nếu không dùng)
    }
}