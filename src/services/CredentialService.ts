import bcrypt from "bcrypt";
export class CredentialService {
  async comparePassowrd(userPassword: string, hashPassword: string) {
    return await bcrypt.compare(userPassword, hashPassword);
  }
}
