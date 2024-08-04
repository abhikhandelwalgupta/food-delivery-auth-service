/* eslint-disable @typescript-eslint/no-unused-vars */

import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {

    describe("POST /tenants", () => {
        let connection: DataSource;
        let jwks: ReturnType<typeof createJWKSMock>;
        let adminToken: string;

        beforeAll(async () => {
            connection = await AppDataSource.initialize();
        });

        beforeEach(async () => {
            // await connection.dropDatabase();
            await connection.synchronize();
            // await truncateTables(connection);
        });

        afterAll(async () => {
            await connection.destroy();
        });

        describe("Give all fields", () => {
        });
    })
});