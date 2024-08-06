/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
// import { Tenant } from "../../src/entity/Tenant";
// import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
  describe("POST /tenants", () => {
    let connection: DataSource;

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
      it("should return a 201 status code", async () => {
        const tenantData = {
          name: "Tenant name",
          address: "Jaipur",
        };
        await request(app).post("/tenants").send(tenantData);

        const tenantRepository = connection.getRepository(Tenant);
        const tenants = await tenantRepository.find()


        expect(tenants).toHaveLength(1);
        expect(tenants[0].name).toBe(tenantData.name);
        expect(tenants[0].address).toBe(tenantData.address)
      });
    });
  });
});
