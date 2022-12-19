import { Page } from "@prisma/client";
import { apiRequest } from "../api.server";
import { getPrimaryCalendar } from "../events/events.server";
import { createSchedulerPages } from "../page.server";
import { getUserByEmails } from "../user.server";

const SCHEDULER_ENDPOINT = "https://api.schedule.nylas.com/manage/pages";

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
        company_name: "GloPros",
        privacy_policy_redirect: "",
        show_autoschedule: true,
        show_nylas_branding: false,
        show_timezone_options: true,
        show_week_view: true,
        submit_text: "",
        thank_you_redirect: "",
        thank_you_text: "Thanks for scheduling",
        thank_you_text_secondary: "",
      },
      booking: {
        additional_fields: [],
        additional_guests_hidden: false,
        available_days_in_future: 30,
        calendar_invite_to_guests: true,
        cancellation_policy: "",
        confirmation_emails_to_guests: true,
        confirmation_emails_to_host: true,
        confirmation_method: "automatic",
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
      page_hostname: "schedule.nylas.com",
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
    }));

    return await createSchedulerPages(pages);
  } catch (error: any) {
    console.log(error);
    throw Error(error);
  }
}
