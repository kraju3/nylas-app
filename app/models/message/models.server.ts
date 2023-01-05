import type { NylasEvent } from "../events/events.server";

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

export type File = {
  content_type: string;
  filename: string | null;
  object: string;
  size: number;
  id: string;
  content_disposition: string;
};

export type Message = {
  account_id: string;
  bcc: EmailParticipants[];
  body: string;
  cc: EmailParticipants[];
  date: number;
  events: NylasEvent[];
  files: File[];
  folder?: {
    display_name: string;
    id: string;
    name: string;
  };
  from: EmailParticipants[];
  id: string;
  object: "message";
  reply_to: EmailParticipants[];
  snippet: string;
  starred: boolean;
  subject: string;
  thread_id: string;
  to: EmailParticipants[];
  unread: boolean;
  labels?: {
    display_name: string;
    id: string;
    name: string;
    provider_id: string;
    account_id: string;
    object: "label";
  }[];
  reply_to_message_id: string | null;
  metadata: object;
  cids: string[];
  file_id?: string[];
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

export type Draft = Partial<Message> & {
  version?: number;
};
