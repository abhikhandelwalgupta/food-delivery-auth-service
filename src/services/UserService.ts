import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import { Logger } from "winston";
import { Roles } from "../constants";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private logger: Logger,
  ) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role = Roles.CUSTOMER,
    tenantId,
  }: UserData) {
    this.logger.debug("inside user service");
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);

    const isUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (isUser) {
      const err = createHttpError(400, "Email is already exists!");
      throw err;
    }

    const user = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashPassword,
      role,
      tenant: tenantId ? { id: tenantId } : undefined,
    });

    return user;
  }
  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async findAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        }),
      );
    }
    if (validatedQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();
    return result;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }

  async update(
    userId: number,
    { firstName, lastName, role, email, tenantId }: LimitedUserData,
  ) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
        email,
        tenant: tenantId ? { id: tenantId } : null,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }
}
