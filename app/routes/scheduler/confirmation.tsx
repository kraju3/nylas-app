import { useLoaderData } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/server-runtime";
import { EventServiceAPI } from "~/models/events/events.server";
import { getUserByNylasId } from "~/models/user.server";
import { ZoomServiceAPI } from "~/models/zoom/zoom.server";
import { parseValuesFromJsonString } from "~/utils";

type Participants = {
  email: string;
  name: string;
  status: string;
};

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  console.log(url.searchParams);

  try {
    const event_id = url.searchParams.get("event_id");
    const timezone = url.searchParams.get("tz");
    const start_time = url.searchParams.get("start_time");
    const account_id = url.searchParams.get("account_id");
    const page_slug = url.searchParams.get("page_slug");
    const edit_hash = url.searchParams.get("edit_hash");
    const additional_values = url.searchParams.get("additional_values");
    if (
      !event_id ||
      !timezone ||
      !start_time ||
      !request ||
      !account_id ||
      !additional_values
    ) {
      throw Error("No query params present from redirect");
    }

    const user = await getUserByNylasId(account_id);

    if (!user) {
      throw Error("No user present");
    }

    const description = `<html><body>
    <div><a href=${
      "https://schedule.nylas.com/" +
      page_slug +
      "/reschedule/" +
      edit_hash +
      "?reschedule=true"
    }>Reschedule </a></div>
     <div><a href=${
       "https://schedule.nylas.com/" + page_slug + "/cancel/" + edit_hash
     }>Cancel </a></div>
    </body></html>`;
    console.log(description);

    const participants = parseValuesFromJsonString<Participants[]>(
      additional_values,
      "participants"
    );

    console.log(participants);

    const intialEvent = await EventServiceAPI.getEvent(event_id, user);

    console.log(intialEvent);

    const payload = {
      title: "Remix Scheduler Event",
      description,
      participants: participants.map(({ name, status, email }) => ({
        name,
        email,
      })),
    };

    console.log(payload);

    const event = await EventServiceAPI.updateEvent(
      event_id,
      user,
      payload,
      true
    );

    console.log(event);

    // await ZoomServiceAPI.addZoomMeeting({
    //   event_id,
    //   timezone,
    //   start_time,
    //   account_id,
    // });

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
