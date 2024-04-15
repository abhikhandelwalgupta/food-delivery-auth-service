import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Logger } from "winston";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

export class UserService {
  constructor(
    private userRespository: Repository<User>,
    private logger: Logger,
  ) {}

  async create({ firstName, lastName, email, password }: UserData) {
    this.logger.debug("inside user service");
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);

    const isUser = await this.userRespository.findOne({
      where: { email: email },
    });

    if (isUser) {
      const err = createHttpError(400, "Email is already exists!");
      throw err;
    }

    const user = await this.userRespository.save({
      firstName,
      lastName,
      email,
      password: hashPassword,
      role: Roles.CUSTOMER,
    });

    return user;
  }
  async findById(id: number) {
    return await this.userRespository.findOne({
      where: { id: id },
    });
  }

  async findByEmail(email: string) {
    return await this.userRespository.findOne({
      where: { email: email },
    });
  }
}
