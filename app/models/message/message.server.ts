import { getUser } from "~/session.server";
import { apiRequest } from "../api.server";
import { User } from "../user.server";

const NYLAS_ENDPOINT = process.env.API_ENDPOINT;

export type Label = {
  display_name: string;
  id: string;
  name: string;
  account_id: string;
  object: "label";
};

export type EmailParticipants = {
  name: string;
  email: string;
};

export type Thread = {
  account_id: string;
  has_attachments: boolean;
  id: string;
  partcipants: EmailParticipants[];
  snippet: string;
  starred: boolean;
  subject: string;
  unread: boolean;
  message_ids: string[];
};

export type ThreadsQueryParams = {
  view: "ids" | "count" | "expanded";
  limit: number;
  offset: number;
  subject: string;
  any_email: string;
  to: string;
  from: string;
  cc: string;
  bcc: string;
  in: string;
  unread: boolean;
  starred: boolean;
  last_message_before: string;
  last_message_after: string;
};

export async function getLabelsOrFolders<T>(
  type: "labels" | "folders",
  user: User
): Promise<T> {
  let res: T;
  try {
    const token = user.accessToken;
    res = await apiRequest({
      url: `${NYLAS_ENDPOINT}/${type}`,
      config: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}

export async function getThreads(
  request: Request,
  queryParams?: Partial<ThreadsQueryParams>
): Promise<Thread[]> {
  let res: Thread[];
  let url = `${NYLAS_ENDPOINT}/threads`;
  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    url += `?${queryString}`;
  }
  try {
    const user = await getUser(request);
    res = await apiRequest({
      url,
      config: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.accessToken}`,
        },
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}
