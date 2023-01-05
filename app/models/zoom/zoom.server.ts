import type { User, ZoomAccount } from "@prisma/client";
import { format } from "date-fns";
import { prisma } from "~/db.server";
import { isExpired } from "~/utils";
import { apiRequest } from "../api.server";
import type { NylasEvent } from "../events/events.server";
import { EventServiceAPI } from "../events/events.server";
import { getUserByNylasId } from "../user.server";

type ZoomUserResponse = {
  id: string;
  email: string;
  account_id: string;
};

type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};

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

export class ZoomService {
  static oAuthEndpoint = "https://zoom.us/oauth/token";

  async authorizeZoom({ code, userId }: { code: string; userId: string }) {
    try {
      const credential = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
        "utf8"
      ).toString("base64");

      const body = `code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000/zoom/redirect`;

      const zoomResponse = await apiRequest<ZoomTokenResponse>({
        url: ZoomService.oAuthEndpoint,
        config: {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credential}`,
          },
          body,
        },
      });

      const zoomUserInfo = await this.getZoomUserInfo(
        zoomResponse.access_token
      );

      const expiresIn = BigInt(
        new Date().getTime() + zoomResponse.expires_in * 1000
      );

      const zoomUser = {
        userId,
        email: zoomUserInfo.email,
        zoomUserId: zoomUserInfo.id,
        accessToken: zoomResponse.access_token,
        refreshToken: zoomResponse.refresh_token,
        expires: expiresIn,
      };

      await ZoomAccountControler.createZoomAccount(zoomUser as ZoomAccount);
    } catch (error: any) {
      console.log(error);
      throw Error("Zoom access retrieval failed");
    }
  }

  async getNewAccessToken(
    zoomUserId: string,
    userId: string,
    refreshToken: string
  ) {
    let account: ZoomAccount;
    try {
      const credential = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
        "utf8"
      ).toString("base64");

      const body = `grant_type=refresh_token&refresh_token=${refreshToken}`;

      const zoomAccount = await ZoomAccountControler.getZoomAccount(
        userId,
        zoomUserId
      );

      if (!zoomAccount) {
        throw Error("No zoom account exists in DB");
      }

      const response = await apiRequest<ZoomTokenResponse>({
        url: ZoomService.oAuthEndpoint,
        config: {
          method: "POST",
          headers: {
            "Content-Tyoe": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credential}`,
          },
          body,
        },
      });

      const expiresIn = BigInt(
        new Date().getTime() + response.expires_in * 1000
      );

      account = await ZoomAccountControler.updateZoomAccount({
        ...zoomAccount,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expires: expiresIn,
      });
      //update db with new access token and refresh token
    } catch (error: any) {
      throw Error(error);
    }
    return account;
  }

  async getZoomUserInfo(accessToken: string): Promise<ZoomUserResponse> {
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

  async createZoomMeeting(
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
      throw Error("Error creating zoom event");
    }
    return res;
  }

  async getZoomAccountInfo(userId: string) {
    let zoomAccount: ZoomAccount;
    try {
      const account = await ZoomAccountControler.getZoomAccount(userId);

      if (!account) {
        throw Error("No zoom credentials present");
      }

      zoomAccount = account;

      const isAccessExpired = isExpired(
        new Date(),
        new Date(Number(zoomAccount.expires.toString()))
      );

      if (isAccessExpired) {
        zoomAccount = await this.getNewAccessToken(
          zoomAccount.zoomUserId,
          zoomAccount.userId,
          zoomAccount.refreshToken
        );
      }
    } catch (error) {
      console.log(error);
      throw Error("Token retrieval failed");
    }
    return zoomAccount;
  }
  async addZoomMeeting({
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
    const zoomAccount = await this.getZoomAccountInfo(user.id);

    const event = await EventServiceAPI.getEvent(event_id, user);

    const zoomMeeting = await this.createZoomMeeting(zoomAccount, {
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

    await EventServiceAPI.updateEvent(event.id, user, conferencingPayload);
  }
}

export class ZoomAccountControler {
  static async getZoomAccount(
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

  static async createZoomAccount({
    email,
    accessToken,
    refreshToken,
    userId,
    zoomUserId,
    expires,
  }: ZoomAccount) {
    const zoomAccount = await this.getZoomAccount(userId, zoomUserId);
    if (zoomAccount) {
      return await this.updateZoomAccount({
        ...zoomAccount,
        accessToken,
        refreshToken,
        email,
        expires,
      });
    }
    return await prisma.zoomAccount.create({
      data: {
        email,
        accessToken,
        refreshToken,
        userId,
        zoomUserId,
        expires,
      },
    });
  }

  static async updateZoomAccount({
    accessToken,
    refreshToken,
    email,
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
}

export const ZoomServiceAPI = new ZoomService();
