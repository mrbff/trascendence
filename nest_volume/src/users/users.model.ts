import { Prisma } from "@prisma/client";

export class Users implements Prisma.UsersCreateInput {
  username: string;
  email: string;
  password: string;
}