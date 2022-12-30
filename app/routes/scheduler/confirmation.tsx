import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/server-runtime";
import { ZoomServiceAPI } from "~/models/zoom/zoom.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  try {
    const event_id = url.searchParams.get("event_id");
    const timezone = url.searchParams.get("tz");
    const start_time = url.searchParams.get("start_time");
    const account_id = url.searchParams.get("account_id");
    if (!event_id || !timezone || !start_time || !request || !account_id) {
      throw Error("No query params present from redirect");
    }

    await ZoomServiceAPI.addZoomMeeting({
      event_id,
      timezone,
      start_time,
      account_id,
    });

    return redirect("/");
  } catch (error: any) {
    throw Error(error);
  }
}

export default function ConfirmationThankYou() {
  const data = useLoaderData();
  return (
    <div className="mt-1 w-full md:container md:mx-auto">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            alt="Thank you for connecting"
            src="https://png.pngitem.com/pimgs/s/200-2005101_schedule-icon-png-transparent-png.png"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">
              Thank you for scheduling a meeting with us.
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
