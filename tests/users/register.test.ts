import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Give all fields", () => {
    it("Should return the 201 status code ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "secret",
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "secret",
      };
      const response = await request(app).post("/auth/register").send(userData);

      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should persist the user in the database ", async () => {
      jest.setTimeout(10000);
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "abhishek",
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
  });
});
