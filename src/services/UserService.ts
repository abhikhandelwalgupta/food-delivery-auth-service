import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Logger } from "winston";

export class UserService {
  constructor(private userRespository: Repository<User>, private logger: Logger) { }

  async create({ firstName, lastName, email, password, role }: UserData) {
    this.logger.debug("inside user service")
    const user = await this.userRespository.save({ firstName, lastName, email, password, role });
    return user;
  }
}
