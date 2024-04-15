/* eslint-disable no-console */
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
//import { truncateTables } from "../utils/index";
/*import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
*/
describe("POST /auth/register", () => {
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
    it("should be status code 400 return ", async () => {
      const userData = {
        email: "abhishekkhandelwal1212@gmail.com",
        password: "",
      };
      const response = await request(app).post("/auth/login").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should be status code 400 return ", async () => {
      const userData = {
        email: "",
        password: "abhi8385",
      };
      const response = await request(app).post("/auth/login").send(userData);
      expect(response.statusCode).toBe(400);
    });

    // it("should login the user ", async () => {
    //     const userData = {
    //         email: "abhishekkhandelwal1212@gmail.com",
    //         password: "abhi8385",
    //     };
    //     const response = await request(app).post("/auth/login").send(userData);
    //     expect(response.statusCode).toBe(200);
    // });
  });
});
