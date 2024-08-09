import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";

describe("POST create/user", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKSMock("http://localhost:5501");
  });

  beforeEach(async () => {
    // await connection.dropDatabase();
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

  describe("Give all fields", () => {
    it("should persist the user in the database ", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212+2@gmail.com",
        password: "abhishek",
        tenant: tenant.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("should return 403  if non admin user tries ", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212+1@gmail.com",
        password: "abhishek",
        tenant: tenant.id,
        role: Roles.MANAGER,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
      expect(users[0].role).toBe(userData.role);
    });
  });
});
