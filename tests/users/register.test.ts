import request from "supertest";
import app from "../../src/app";

describe("POST", () => {
  describe("Give all fields", () => {
    it("Should return the 201 status code ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        passowrd: "secret",
      };
      const response = await request(app).post("/auth/register").send(userData);
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response ", async () => {
      const userData = {
        firstName: "Abhishek",
        lastName: "Khandelwal",
        email: "abhishekkhandelwal1212@gmail.com",
        passowrd: "secret",
      };
      const response = await request(app).post("/auth/register").send(userData);

      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should persist the user in the database ", () => {});
  });
});
