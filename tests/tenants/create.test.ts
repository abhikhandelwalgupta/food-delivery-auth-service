import createJWKSMock from "mock-jwks";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import request from "supertest";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
// import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();
    adminToken = jwks.token({
      sub: "1",
      role: Roles.ADMIN,
    });
    // await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(() => {
    jwks.stop();
  });

  describe("Give all fields", () => {
    it("should return a 401 status code", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Jaipur",
      };
      const response = await request(app).post("/tenants").send(tenantData);
      expect(response.statusCode).toBe(401);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(0);
    });

    it("should create a tenant in the database", async () => {
      const tenantData = {
        name: "Tenant name",
        address: "Jaipur",
      };
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });
  });
});
