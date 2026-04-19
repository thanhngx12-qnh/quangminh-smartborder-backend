// dir: ~/quangminh-smart-border/backend/src/db/migrations/1776567806531-AddCategoryAndSeo.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryAndSeo1776567806531 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tạo bảng categories nếu chưa có
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" SERIAL PRIMARY KEY,
                "name" varchar NOT NULL,
                "slug" varchar NOT NULL UNIQUE,
                "type" varchar NOT NULL,
                "description" text,
                "parentId" integer,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // 2. Thêm cột categoryId vào news và services
        await queryRunner.query(`ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "categoryId" integer`);

        // 3. Kiểm tra và thêm cột SEO cho news_translations
        const newsTransExists = await queryRunner.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'news_translations')`);
        if (newsTransExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "news_translations" ADD COLUMN IF NOT EXISTS "metaTitle" varchar(255)`);
            await queryRunner.query(`ALTER TABLE "news_translations" ADD COLUMN IF NOT EXISTS "metaDescription" text`);
            await queryRunner.query(`ALTER TABLE "news_translations" ADD COLUMN IF NOT EXISTS "metaKeywords" text`);
            await queryRunner.query(`ALTER TABLE "news_translations" ADD COLUMN IF NOT EXISTS "ogImage" varchar(500)`);
        }

        // 4. Kiểm tra và thêm cột SEO cho service_translations
        const serviceTransExists = await queryRunner.query(`SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'service_translations')`);
        if (serviceTransExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "service_translations" ADD COLUMN IF NOT EXISTS "metaTitle" varchar(255)`);
            await queryRunner.query(`ALTER TABLE "service_translations" ADD COLUMN IF NOT EXISTS "metaDescription" text`);
            await queryRunner.query(`ALTER TABLE "service_translations" ADD COLUMN IF NOT EXISTS "metaKeywords" text`);
            await queryRunner.query(`ALTER TABLE "service_translations" ADD COLUMN IF NOT EXISTS "ogImage" varchar(500)`);
        }

        // 5. CHUYỂN ĐỔI DỮ LIỆU & XÓA CỘT CŨ (Quan trọng cho Production)
        // Kiểm tra xem cột 'category' cũ có còn tồn tại không
        const hasOldCategory = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='services' AND column_name='category'
        `);

        if (hasOldCategory.length > 0) {
            // A. Copy các danh mục cũ sang bảng categories mới
            await queryRunner.query(`
                INSERT INTO "categories" ("name", "slug", "type")
                SELECT DISTINCT "category", LOWER(REPLACE("category", ' ', '-')), 'SERVICE'
                FROM "services"
                WHERE "category" IS NOT NULL AND "category" != ''
                ON CONFLICT (slug) DO NOTHING
            `);

            // B. Cập nhật categoryId cho các dịch vụ cũ
            await queryRunner.query(`
                UPDATE "services" s
                SET "categoryId" = c.id
                FROM "categories" c
                WHERE s."category" = c.name AND c.type = 'SERVICE'
            `);

            // C. XÓA CỘT CŨ (Thao tác này ngăn chặn triệt để lỗi 500 NOT NULL)
            await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "category"`);
        }

        // 6. Thêm Foreign Key Constraints
        try {
            await queryRunner.query(`ALTER TABLE "news" ADD CONSTRAINT "FK_news_category_new" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL`);
        } catch (e) { console.log("FK news_category already exists or error"); }

        try {
            await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_services_category_new" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL`);
        } catch (e) { console.log("FK services_category already exists or error"); }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback logic
    }
}