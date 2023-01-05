import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { EventServiceAPI } from "~/models/events/events.server";
import { getUserByNylasId } from "~/models/user.server";
import type { EventWebhook } from "~/models/webhook/webhook.server";
import { verifyWebhookSignature } from "~/models/webhook/webhook.server";

export const action = async ({ request }: ActionArgs) => {
  const payload = (await request.json()) as EventWebhook;

  console.log(payload);
  /* Validate the webhook */
  const isVerified = await verifyWebhookSignature(request, payload);
  console.log(isVerified);

  if (!isVerified) {
    return new Response("", {
      status: 200,
    });
  }

  for (const delta of payload.deltas) {
    const user = await getUserByNylasId(delta.object_data.account_id);
    if (!user) {
      continue;
    }

    const event = await EventServiceAPI.getEvent(delta.object_data.id, user);
    console.log(`${delta.type}\n\n`, event);
  }

  /* process the webhook (e.g. enqueue a background job) */

  return new Response("", {
    status: 200,
  });
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const challenge = url.searchParams.get("challenge");
  console.log(challenge);
  return new Response(challenge, {
    status: 200,
  });
};
