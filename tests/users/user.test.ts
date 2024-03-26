/* eslint-disable no-console */
import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { DataSource } from "typeorm";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
//import { truncateTables } from "../utils/index";

describe("POST /auth/register", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        // await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Give all fields", () => {
        it("Should return the 200 status code ", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it("Should return User data ", async () => {
            //Register User

            const userData = {
                firstName: "Abhishek",
                lastName: "Khandelwal",
                email: "abhishekkhandelwal1212@gmail.com",
                password: "abhi8385",
                role: Roles.CUSTOMER,
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData });

            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: String(data.role),
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect((response.body as Record<string, string>).id).toBe(data.id);
        });


        it("Should not return password fields ", async () => {
            //Register User

            const userData = {
                firstName: "Abhishek",
                lastName: "Khandelwal",
                email: "abhishekkhandelwal1212@gmail.com",
                password: "abhi8385",
                role: Roles.CUSTOMER,
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({ ...userData });

            //Generate Token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: String(data.role),
            });
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();

            expect((response.body as Record<string, string>)).not.toHaveProperty("password");
        });
    });
});
