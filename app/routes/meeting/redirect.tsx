import { LoaderArgs, redirect } from "@remix-run/node";
import { getSchedulerPage, SchedulerPageType } from "~/models/page.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as SchedulerPageType;
  if (!type) {
    throw Error("Page not found");
  }
  const page = await getSchedulerPage(type);
  const pageUrl = `${process.env.SCHEDULER_WEB}/${page.pageSlug}`;

  return redirect(pageUrl);
}
