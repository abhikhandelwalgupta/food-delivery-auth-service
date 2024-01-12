import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
//import { truncateTables } from "../utils/index";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    // await truncateTables(connection);
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
        role: "customer"
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
        role: "customer"
      };
      const response = await request(app).post("/auth/register").send(userData);

      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should persist the user in the database ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "abhishek",
        role: "customer"
      };

      await request(app).post("/auth/register").send(userData);
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });


    it("should assign a customer role ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "secret",
        role: "customer"
      };
      await request(app).post("/auth/register").send(userData);

      //Assert

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role")
      expect(users[0].role).toBe(Roles.CUSTOMER);

    });

    it("should store the hashed password in the database ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "secret",
        role: "customer"
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0].password).not.toBe(userData.password)
    });

    it("should return 400 status code if email is already exists", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "secret",
        role: "customer"
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save(userData)
      await request(app).post("/auth/register").send(userData);
    })
  });
});
