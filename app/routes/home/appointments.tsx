import { SchedulerEvent } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { handleSchedulerEvent } from "~/models/admin/scheduler.server";
import { EventController } from "~/models/events/events.server";
import { getSchedulerPages } from "~/models/page.server";
import { getUsers } from "~/models/user.server";
import { getUser } from "~/session.server";

type LoaderData = {
  appointments: Awaited<ReturnType<typeof EventController.getSchedulerEvents>>;
};

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    throw Error("Error finding user");
  }
  return json<LoaderData>({
    appointments: await EventController.getSchedulerEvents(user),
  });
}

export async function action({ request }: ActionArgs) {
  const user = await getUser(request);
  if (!user) {
    throw Error("Error finding user");
  }
  const url = new URL(request.url);

  const type = url.searchParams.get("type") as "delete" | "reschedule";
  const pageSlug = url.searchParams.get("pageSlug");
  const body = await request.formData();
  const event_id = body.get("event_id") as string;

  if (!type || !pageSlug || !event_id) {
    throw Error("error with action method in /appointments/home");
  }

  const redirectUrl = await handleSchedulerEvent(
    user,
    type,
    event_id,
    pageSlug
  );

  return redirect(redirectUrl);
}

function AppointmentComponent({
  appointment,
}: {
  appointment: SchedulerEvent;
}) {
  return (
    <div className="neutral-content card m-5 w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title overflow-hidden text-ellipsis">
          {appointment.title}
        </h2>
        <h4>{new Date(appointment.startTime).toDateString()}</h4>
        <div className="card-actions justify-end">
          <div className="placeholder avatar">
            <Form
              action={`/home/appointments?type=reschedule&pageSlug=${appointment.pageSlug}`}
              method="post"
            >
              <input hidden value={appointment.eventId} name="event_id" />
              <button type="submit" className="btn-outline btn">
                Reschedule
              </button>
            </Form>
            <Form
              className="ml-2"
              action={`/home/appointments?type=delete&pageSlug=${appointment.pageSlug}`}
              method="post"
            >
              <input hidden value={appointment.eventId} name="event_id" />
              <button type="submit" className="btn-outline btn">
                Delete
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPortal() {
  const { appointments } = useLoaderData() as unknown as LoaderData;
  return (
    <>
      <div className="center flex w-full flex-wrap justify-center md:container md:mx-auto">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold">Appointments</h2>
        </div>
        {appointments.map((appointment) => (
          <AppointmentComponent
            key={appointment.pageSlug}
            appointment={appointment}
          />
        ))}
      </div>
    </>
  );
}
