import request from "supertest";
import app from "./src/app";

describe("App", () => {
  test("Should work", () => {});

  it("should return 200 status ", async () => {
    const res = await request(app).get("/").send();

    expect(res.statusCode).toBe(200);
  });
});
