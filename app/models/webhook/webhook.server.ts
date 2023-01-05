import crypto from "crypto";

export type EventWebhook = {
  deltas: WebhookDelta<EventDelta>[];
};

type WebhookDelta<T> = {
  date: number;
  object: string;
  type: string;
  object_data: T;
};

type EventDelta = {
  account_id: string;
  object: "event";
  id: string;
};

export async function verifyWebhookSignature(request: Request, payload: any) {
  const signature = request.headers.get("X-Nylas-Signature");
  const generatedSignature = `sha256=${crypto
    .createHmac("sha256", process.env.NYLAS_CLIENT_SECRET || "")
    .update(JSON.stringify(payload))
    .digest("hex")}`;
  return signature !== generatedSignature;
}
