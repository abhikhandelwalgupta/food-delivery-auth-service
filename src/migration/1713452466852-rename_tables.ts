import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTables1713452466852 implements MigrationInterface {
  name = "RenameTables1713452466852";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`,
    );
    await queryRunner.renameTable("user", "users");
    await queryRunner.renameTable("refresh_token", "refresh_tokens");
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "RefreshTokens" DROP CONSTRAINT "FK_6dfd786f75cfe054e9ae3a45f5e"`,
    );
    await queryRunner.renameTable("refresh_tokens", "refresh_token");
    await queryRunner.renameTable("users", "user");
  }
}
