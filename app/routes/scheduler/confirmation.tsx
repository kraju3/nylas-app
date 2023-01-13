import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/server-runtime";
import {
  createSchedulerEvent,
  updateSchedulerEvent,
} from "~/models/admin/scheduler.server";
import { EventServiceAPI } from "~/models/events/events.server";
import { getUserByNylasId } from "~/models/user.server";
import { ZoomServiceAPI } from "~/models/zoom/zoom.server";
import { parseValuesFromJsonString } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("event_id");

  if (!eventId) {
    await createSchedulerEvent(url);
  } else {
    await updateSchedulerEvent(url);
  }

  console.log(url.searchParams);

  try {
    return redirect("/");
  } catch (error: any) {
    console.log(error);
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
