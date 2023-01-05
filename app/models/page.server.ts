import { Page } from "@prisma/client";
import { prisma } from "~/db.server";

export enum SchedulerPageType {
  COMPANY = "company",
  ONE_TO_ONE = "1:1",
}

export type SchedulerPageInfo = {
  editToken: string;
  pageId: number;
  pageSlug: string;
  accountId: string;
  type: SchedulerPageType;
};

//Due to SQLite restriction I need to create it one by one
export async function createSchedulerPages(
  schedulerPages: SchedulerPageInfo[]
) {
  const pages = [];
  for (let page of schedulerPages) {
    pages.push(
      await prisma.page.create({
        data: page,
      })
    );
  }
  return pages;
}

export async function getSchedulerPages() {
  return await prisma.page.groupBy({
    by: ["pageId", "pageSlug", "editToken"],
  });
}

export async function getSchedulerPage(type: SchedulerPageType) {
  return await prisma.page.findFirstOrThrow({
    where: {
      type,
    },
  });
}

export async function deleteSchedulerPagesBySlug(slug: Page["pageSlug"]) {
  const pages = await prisma.page.findMany({
    where: {
      pageSlug: slug,
    },
  });
  await prisma.page.deleteMany({
    where: {
      pageSlug: slug,
    },
  });

  return pages;
}
