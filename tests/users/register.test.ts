import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
//import { truncateTables } from "../utils/index";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { isJwt } from "./../utils";

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
        password: "abhi8385",
        role: "customer",
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "abhi8385",
        role: "customer",
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
        role: "customer",
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
        password: "abhi8385",
        role: "customer",
      };
      await request(app).post("/auth/register").send(userData);

      //Assert

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store the hashed password in the database ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "abhi8385",
        role: "customer",
      };

      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users[0].password).not.toBe(userData.password);
    });

    it("should return 400 status code if email is already exists", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        password: "abhi8385",
        role: "customer",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields are missing ", () => {
    it("should return 400 status code if email field is missing ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "abhi8385",
        email: "",
      };

      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if firstName is missing", async () => {
      const userData = {
        firstName: "",
        lastName: "Doe",
        password: "abhi8385",
        email: "abhishekkhandelwal1212@gmail.com",
      };

      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if lastName is missing", async () => {
      const userData = {
        firstName: "Joe",
        lastName: "",
        password: "abhi8385",
        email: "abhishekkhandelwal1212@gmail.com",
      };

      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if Password is missing", async () => {
      const userData = {
        firstName: "Joe",
        lastName: "Doe",
        password: "",
        email: "abhishekkhandelwal1212@gmail.com",
      };

      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(400);
    });

    it("should return the access token and referce token inside a cookie ", async () => {
      const userData = {
        firstName: "Abhi",
        lastName: "Kumar",
        password: "abhi8385",
        email: "abhishekkhandelwal1212@gmail.com",
      };

      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      interface Headers {
        ["set-cookie"]: string[];
      }
      let accessToken = null;
      let refreshToken = null;
      const cookies = (response.header as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();

      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });

  describe("Fields are not in proper format", () => {
    it("shold trim the email field ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "abhi8385",
        email: " abhishekkhandelwal@gmail.com ",
      };

      await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];

      expect(user.email).toBe("abhishekkhandelwal@gmail.com");
    });

    it("should return 400 status code if email is not valid email ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "abhi8385",
        email: "abhishek",
      };

      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      // const userRepository = connection.getRepository(User);
      // const users = await userRepository.find();
      // const user = users[0]

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password length is not greater 8 ", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        password: "abhi838",
        email: "abhishek",
      };

      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      // const userRepository = connection.getRepository(User);
      // const users = await userRepository.find();
      // const user = users[0]

      expect(response.statusCode).toBe(400);
    });
  });
});
