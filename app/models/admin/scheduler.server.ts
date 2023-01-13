import { Page } from "@prisma/client";
import { parseValuesFromJsonString } from "~/utils";
import { apiRequest } from "../api.server";
import {
  EventController,
  EventServiceAPI,
  getPrimaryCalendar,
  NylasEvent,
} from "../events/events.server";
import {
  createSchedulerPages,
  deleteSchedulerPagesBySlug,
  SchedulerPageType,
} from "../page.server";
import { getUserByEmails, getUserByNylasId } from "../user.server";

const SCHEDULER_ENDPOINT = `${process.env.SCHEDULER_API}/manage/pages`;

type Participants = {
  email: string;
  name: string;
  status: string;
};

type SchedulerPayload = {
  name: string;
  slug: string;
  title: string;
  scheduling_method: string;
  users: {
    accountId: string;
    calendarId: string;
    accessToken: string;
  }[];
};

type AvailabilityObject = {
  [key: string]: {
    availability: string[];
    booking: string;
  };
};

type SchedulerResponse = {
  edit_token: string;
  id: number;
  slug: string;
};

const generateSchedulerPayload = ({
  name,
  slug,
  title,
  users,
  scheduling_method,
}: SchedulerPayload) => {
  const calendar_ids: AvailabilityObject = users.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.accountId]: {
        availability: [curr.calendarId],
        booking: curr.calendarId,
      },
    };
  }, {});

  const opening_hours = users.map((user) => {
    return {
      account_id: user.accountId,
      days: ["M", "T", "W", "R", "F"],
      end: "17:00",
      start: "09:00",
    };
  });

  const access_tokens = users.map((user) => user.accessToken);

  return {
    access_tokens,
    config: {
      appearance: {
        color: "blue",
        company_name: "Nylas",
        privacy_policy_redirect: "",
        show_autoschedule: true,
        show_nylas_branding: false,
        show_timezone_options: true,
        show_week_view: true,
        submit_text: "",
        thank_you_redirect: "http://localhost:3000/scheduler/confirmation",
        thank_you_text: "Thanks for scheduling",
        thank_you_text_secondary: "",
      },
      booking: {
        additional_fields: [],
        additional_guests_hidden: false,
        available_days_in_future: 30,
        calendar_invite_to_guests: false,
        cancellation_policy: "",
        confirmation_emails_to_guests: false,
        confirmation_emails_to_host: true,
        confirmation_method: "external",
        interval_minutes: null,
        min_booking_notice: 5,
        min_buffer: 5,
        min_cancellation_notice: 10,
        name_field_hidden: false,
        opening_hours,
        scheduling_method,
      },
      calendar_ids,
      disable_emails: false,
      event: {
        capacity: 1,
        duration: 30,
        location: "TBD",
        title,
      },
      locale: "en",
      reminders: [
        {
          delivery_method: "email",
          delivery_recipient: "both",
          email_subject: "Reminder - meeting about to start",
          time_before_event: 15,
          webhook_url: "",
        },
      ],
      timezone: "America/Chicago",
    },
    name,
    slug,
  };
};

export async function createNylasSchedulerPage(
  body: FormData,
  radioFields: string[]
) {
  try {
    const name = body.get("name") as string;
    const slug = body.get("slug") as string;
    const title = body.get("title") as string;
    const scheduling_method = body.get("scheduling_method") as string;
    const type = body.get("scheduling_purpose") as SchedulerPageType;

    const emails = radioFields.map((fieldKey) =>
      body.get(fieldKey)
    ) as string[];

    const users = await getUserByEmails(emails);

    const userObject: SchedulerPayload["users"] = [];

    for (let user of users) {
      const calendarId = await getPrimaryCalendar(user);
      userObject.push({
        calendarId,
        accountId: user.accountId,
        accessToken: user.accessToken,
      });
    }

    const payload = generateSchedulerPayload({
      name,
      slug,
      scheduling_method,
      title,
      users: userObject,
    });

    const schedulerResponse: SchedulerResponse = await apiRequest({
      url: `${SCHEDULER_ENDPOINT}`,
      config: {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${users[0].accessToken}`,
        },
      },
    });
    const pages = users.map((user) => ({
      pageId: schedulerResponse.id,
      pageSlug: schedulerResponse.slug,
      accountId: user.accountId,
      editToken: schedulerResponse.edit_token,
      type,
    }));

    return await createSchedulerPages(pages);
  } catch (error: any) {
    console.log(error);
    throw Error(error);
  }
}

export async function deleteSchedulerPage(page_slug: string) {
  try {
    const pageesToDelete = await deleteSchedulerPagesBySlug(page_slug);

    for (const page of pageesToDelete) {
      const res: { success: boolean } = await apiRequest({
        url: `${SCHEDULER_ENDPOINT}/${page.pageId}`,
        config: {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${page.editToken}`,
          },
        },
      });

      if (!res.success) {
        throw Error(`Scheduler page with ${page.pageSlug} failed to delete`);
      }
    }
  } catch (error: any) {
    throw Error(error);
  }
}

export async function createSchedulerEvent(url: URL) {
  try {
    console.log(url.searchParams);
    const calendar_id = url.searchParams.get("calendar_id");
    const start_time = url.searchParams.get("start_time");
    const account_id = url.searchParams.get("account_id");
    const page_slug = url.searchParams.get("page_slug");
    const end_time = url.searchParams.get("end_time");
    const participantName = url.searchParams.get("participant_name");
    const participantEmail = url.searchParams.get("participant_email");
    const rescheduleEventId = url.searchParams.get("reschedule_event_id");
    if (
      !calendar_id ||
      !start_time ||
      !account_id ||
      !end_time ||
      !page_slug ||
      !participantName ||
      !participantEmail
    ) {
      console.debug(
        "Missing params",
        calendar_id,
        account_id,
        start_time,
        end_time,
        page_slug,
        participantEmail,
        participantName
      );
      throw Error("No query params present from redirect");
    }

    const user = await getUserByNylasId(account_id);

    if (!user) {
      throw Error("No user present");
    }

    const payload = {
      title: "Remix Scheduler Confirmation External",
      description: "This is a test event",
      when: {
        start_time: parseInt(start_time),
        end_time: parseInt(end_time),
      },
      calendar_id,
      ...(!rescheduleEventId && {
        participants: [
          {
            name: participantName,
            email: participantEmail,
          },
        ],
      }),
    };

    let event: NylasEvent;

    if (!rescheduleEventId) {
      event = await EventServiceAPI.createEvent(user, payload, true);

      await EventController.createSchedulerEvent({
        accountId: account_id,
        pageSlug: page_slug,
        eventId: event.id,
        isCancelled: false,
      });
    } else {
      console.log("Rescheduling");
      event = await EventServiceAPI.updateEvent(
        rescheduleEventId,
        user,
        payload,
        true
      );
    }

    //here add this event to the DB and reschedule links will contain this id so the user can reschedule the event

    console.log(event);
  } catch (error) {
    throw Error("Scheduler event couldn't be updated");
  }
}

export async function updateSchedulerEvent(url: URL) {
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
  } catch (error) {
    throw Error("Scheduler event couldn't be updated");
  }

  // await ZoomServiceAPI.addZoomMeeting({
  //   event_id,
  //   timezone,
  //   start_time,
  //   account_id,
  // });
}
