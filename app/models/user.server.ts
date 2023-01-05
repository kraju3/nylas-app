import type { User } from "@prisma/client";
import { json } from "@remix-run/server-runtime";

import { prisma } from "~/db.server";
import type { UserInformation } from "~/utils";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByNylasId(accountId: User["accountId"]) {
  return prisma.user.findUnique({
    where: {
      accountId,
    },
  });
}

export async function getUsers() {
  return await prisma.user.findMany({
    where: {
      admin: false,
    },
  });
}

export async function getUserByEmails(emails: User["email"][]) {
  return prisma.user.findMany({
    where: {
      email: {
        in: emails,
      },
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({
  email,
  accessToken,
  accountId,
  isAdmin,
}: UserInformation) {
  return prisma.user.create({
    data: {
      email,
      accountId,
      accessToken,
      admin: isAdmin,
    },
  });
}

export async function updateUserToken(
  email: User["email"],
  token: User["accessToken"]
) {
  return prisma.user.update({
    where: { email },
    data: {
      accessToken: token,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}
