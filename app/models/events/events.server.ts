import { getUser } from "~/session.server";
import { generateQueryString } from "~/utils";
import { apiRequest } from "../api.server";
import type { User } from "../user.server";

const NYLAS_ENDPOINT = `${process.env.API_ENDPOINT}`;

export type NylasEvent = {
  busy: boolean;
  description: string | null;
  location: string | null;
  participants: EventParticipants[];
  title: string;
  updated_at: number;
  when: EventTime;
  conferencing: object;
  recurrence: Recurrence;
  metadata: Record<string, string>;
  account_id: string;
  calendar_id: string;
  ical_uid: string | null;
  id: string;
  original_start_time: string;
  object: "event";
  owner: string;
  organizer_email: string;
  organizer_name: string;
  read_only: boolean;
  status: "confirmed" | "cancelled";
  visibility: "private" | "public" | "normal";
};

type EventTime = TimeSpan | Time | DateSpan | Date;
type TimeSpan = {
  start_time: string;
  end_time: number;
  object: "timespan";
};
type Time = {
  time: number;
  timezone: string;
  object: "time";
};
type DateSpan = {
  start_date: string;
  end_date: string;
  object: "datespan";
};
type Date = {
  date: string;
  object: "date";
};

type Recurrence = {
  rrule: string[];
  timezone: string;
};

type EventParticipants = {
  name: string;
  email: string;
  status: "yes" | "no" | "maybe" | "noreply";
  comment?: string;
  phone_number: string | null;
};

type EventQueryParams = {
  show_cancelled: boolean;
  limit: number;
  offset: number;
  event_id: string;
  calendar_id: string;
  title: string;
  description: string;
  location: string;
  starts_before: string;
  starts_after: string;
  ends_before: string;
  ends_after: string;
  updated_at_before: number;
  updated_at_after: number;
  expand_recurring: boolean;
  busy: boolean;
  count: string;
  participants: string;
};

class EventService {
  eventEndpoint = `${NYLAS_ENDPOINT}/events`;

  async getEvents(
    request: Request,
    queryParams?: Partial<EventQueryParams>
  ): Promise<NylasEvent[]> {
    let res: NylasEvent[];
    const user = await getUser(request);

    if (!user) {
      throw Error("No user access");
    }

    const queryString = generateQueryString(queryParams || {});
    let url = this.eventEndpoint;
    if (queryString) {
      url += `?${queryString}`;
    }

    try {
      res = await apiRequest({
        url,
        config: {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
    return res;
  }

  async getEvent(eventId: string, user: User) {
    let res: NylasEvent;
    try {
      res = await apiRequest({
        url: `${this.eventEndpoint}/${eventId}`,
        config: {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        },
      });
    } catch (error) {
      throw Error("Error fetching Nylas Event");
    }
    return res;
  }

  async updateEvent(
    eventId: string,
    user: User,
    payload: any,
    notifyParticipants = false
  ) {
    let res: NylasEvent;
    try {
      if (!user) {
        throw Error("no user present");
      }

      res = await apiRequest({
        url: `${this.eventEndpoint}/${eventId}?notify_participants=${notifyParticipants}`,
        config: {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      });
    } catch (error) {
      console.log(error);
      throw Error("Error updating Nylas Event");
    }
    return res;
  }
}

export async function getPrimaryCalendar(user: User) {
  let res: string;
  let url = `${NYLAS_ENDPOINT}/calendars`;
  try {
    const calendars: any[] = await apiRequest({
      url,
      config: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      },
    });
    res = calendars.find((calendar) => calendar.is_primary).id;
  } catch (error) {
    throw Error;
  }
  return res;
}

export const EventServiceAPI = new EventService();
