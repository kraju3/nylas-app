import { Page } from "@prisma/client";
import { prisma } from "~/db.server";

export type SchedulerPageInfo = {
  editToken: string;
  pageId: number;
  pageSlug: string;
  accountId: string;
};

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
  return await prisma.page.findMany();
}
