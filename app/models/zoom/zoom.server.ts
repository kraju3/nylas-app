import { User, ZoomAccount } from "@prisma/client";
import { apiRequest } from "../api.server";
import { prisma } from "~/db.server";
import { getEvent, NylasEvent, updateEvent } from "../events/events.server";
import { getUser } from "~/session.server";
import { format } from "date-fns";
import { getUserByNylasId } from "../user.server";

type ZoomUserResponse = {
  id: string;
  email: string;
  account_id: string;
};

type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: BigInt;
  scope: string;
};

export async function authorizeZoom({
  code,
  userId,
}: {
  code: string;
  userId: string;
}) {
  try {
    const credential = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
      "utf8"
    ).toString("base64");

    const body = `code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000/zoom/redirect`;
    console.log(credential);
    console.log(body);

    const zoomResponse = await apiRequest<ZoomTokenResponse>({
      url: "https://zoom.us/oauth/token",
      config: {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credential}`,
        },
        body,
      },
    });

    const zoomUserInfo = await getZoomUserInfo(zoomResponse.access_token);

    const zoomUser = {
      userId,
      email: zoomUserInfo.email,
      zoomUserId: zoomUserInfo.id,
      accessToken: zoomResponse.access_token,
      refreshToken: zoomResponse.refresh_token,
    };

    await createZoomAccount(zoomUser as ZoomAccount);
  } catch (error: any) {
    console.log(error);
    throw Error("Zoom access retrieval failed");
  }
}

export async function getNewAccessToken(
  zoomUserId: string,
  userId: string,
  refreshToken: string
) {
  try {
    const credential = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
      "utf8"
    ).toString("base64");

    const body = `grant_type=refresh_token&refresh_token=${refreshToken}`;

    const zoomAccount = await getZoomAccount(userId, zoomUserId);

    if (!zoomAccount) {
      throw Error("No zoom account exists in DB");
    }

    const response = await apiRequest<ZoomTokenResponse>({
      url: "https://zoom.us/oauth/token",
      config: {
        method: "POST",
        headers: {
          "Content-Tyoe": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credential}`,
        },
        body,
      },
    });

    await updateZoomAccount({
      ...zoomAccount,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    });
    //update db with new access token and refresh token
  } catch (error: any) {
    throw Error(error);
  }
}

export async function getZoomUserInfo(
  accessToken: string
): Promise<ZoomUserResponse> {
  let response: ZoomUserResponse;
  try {
    response = await apiRequest({
      url: "https://api.zoom.us/v2/users/me",
      config: {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  } catch (error) {
    throw Error("Accessing https://api.zoom.us/v2/users/me threw an error");
  }

  return response;
}

export async function getZoomAccount(
  userId: User["id"],
  zoomUserId?: ZoomAccount["zoomUserId"]
) {
  return await prisma.zoomAccount.findFirst({
    where: {
      ...(zoomUserId && { zoomUserId }),
      userId,
    },
  });
}

export async function createZoomAccount({
  email,
  accessToken,
  refreshToken,
  userId,
  zoomUserId,
}: ZoomAccount) {
  const zoomAccount = await getZoomAccount(userId, zoomUserId);
  if (zoomAccount) {
    return await updateZoomAccount({
      ...zoomAccount,
      accessToken,
      refreshToken,
      email,
    });
  }
  return await prisma.zoomAccount.create({
    data: {
      email,
      accessToken,
      refreshToken,
      userId,
      zoomUserId,
    },
  });
}

export async function updateZoomAccount({
  accessToken,
  refreshToken,
  email,
  zoomUserId,
  id,
}: ZoomAccount) {
  return await prisma.zoomAccount.update({
    where: {
      id,
    },
    data: {
      ...(accessToken && { accessToken }),
      ...(refreshToken && { refreshToken }),
      ...(email && { email }),
    },
  });
}

type ZoomMeetingConfig = {
  event: NylasEvent;
  start_time: string;
  timezone: string;
};

type ZoomMeetingResponse = {
  join_url: string;
  id: string;
  password: string;
  meeting_code: string;
  settings: {
    global_dial_in_numbers: {
      number: string;
    }[];
  };
};

export async function createZoomMeeting(
  zoomAccount: ZoomAccount,
  { event, start_time, timezone }: ZoomMeetingConfig
) {
  let eventStart = new Date(parseInt(start_time) * 1000);
  let startTime = `${format(eventStart, "yyyy-MM-dd")}T${format(
    eventStart,
    "HH:mm:ss"
  )}`;

  const payload = {
    agenda: `${event.title}`,
    default_password: false,
    duration: 30,
    password: `${event.id.slice(0, 7)}`,
    pre_schedule: false,
    schedule_for: `${zoomAccount.email}`,
    settings: {},
    start_time: startTime,
    timezone,
    topic: `${event.title}`,
    type: 2,
  };

  //For a weird bug on Zoom side I had to do this multiple times
  let body = JSON.stringify(payload);

  let res: ZoomMeetingResponse;
  try {
    res = await apiRequest<ZoomMeetingResponse>({
      url: `https://api.zoom.us/v2/users/me/meetings`,
      config: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${zoomAccount.accessToken}`,
        },
        body: JSON.stringify(JSON.parse(body)),
      },
    });
  } catch (error: any) {
    console.log(error?.status);
    throw Error("Error creating zoom event");
  }
  return res;
}

export async function addZoomMeeting({
  event_id,
  timezone,
  start_time,
  account_id,
}: {
  event_id: string;
  timezone: string;
  start_time: string;
  account_id: string;
}) {
  const user = await getUserByNylasId(account_id);
  if (!user) {
    throw Error("No user present");
  }
  const zoomAccount = await getZoomAccount(user.id);
  if (!zoomAccount) {
    throw Error("No zoom credentials present");
  }
  const event = await getEvent(event_id, user);

  const zoomMeeting = await createZoomMeeting(zoomAccount, {
    event,
    start_time,
    timezone,
  });

  const conferencingPayload = {
    conferencing: {
      provider: "Zoom Meeting",
      details: {
        url: zoomMeeting.join_url,
        meeting_code: `${zoomMeeting.id}`,
        password: zoomMeeting.password,
      },
    },
  };

  await updateEvent(event.id, user, conferencingPayload);
}
