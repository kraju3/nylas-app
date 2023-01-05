import { json, LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSchedulerPage, SchedulerPageType } from "~/models/page.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as SchedulerPageType;
  if (!type) {
    throw Error("Page not found");
  }
  const page = await getSchedulerPage(type);
  const pageUrl = `${process.env.SCHEDULER_WEB}/${page.pageSlug}`;

  return json({
    pageUrl,
  });
}

export default function SchedulerPage() {
  const { pageUrl } = useLoaderData();

  return (
    <>
      <div className="container h-full w-full md:mx-auto">
        <iframe
          className="h-full w-full"
          title="Scheduler Page"
          src={pageUrl}
        ></iframe>
      </div>
    </>
  );
}
