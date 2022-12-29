import { ActionArgs, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { addZoomMeeting } from "~/models/zoom/zoom.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  const event_id = url.searchParams.get("event_id");
  const timezone = url.searchParams.get("tz");
  const start_time = url.searchParams.get("start_time");
  const account_id = url.searchParams.get("account_id");
  if (!event_id || !timezone || !start_time || !request || !account_id) {
    throw Error("No query params present from redirect");
  }

  await addZoomMeeting({ event_id, timezone, start_time, account_id });

  return redirect("/home");
}
