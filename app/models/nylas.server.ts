import { createUserSession } from "~/session.server";
import { NylasAccount } from "~/utils";
import { apiRequest } from "./api.server";
import { getToken, getUserInfo } from "./google.server";
import {
  createUser,
  getUserByEmail,
  updateUserToken,
  User,
} from "./user.server";

const NYLAS_ENDPOINT = process.env.API_ENDPOINT;
const NYLAS_CLIENT_ID = process.env.NYLAS_CLIENT_ID;
const NYLAS_CLIENT_SECRET = process.env.NYLAS_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

type NylasAuthorizeResponse = {
  code: string;
};

type NylasTokenRequest = NylasAuthorizeResponse & {
  client_id?: string;
  client_secret?: string;
};

export enum NylasProviders {
  GOOGLE = "gmail",
  OUTLOOK = "outlook",
  OFFICE365 = "office365",
}

type NylasAuthorizeGoogleSetting = {
  google_client_id?: string;
  google_client_secret?: string;
  google_refresh_token: string;
};

type NylasAuthorizeRequest<T> = {
  client_id: string | undefined;
  provider: NylasProviders;
  email_address: string;
  name: string;
  settings: T;
  scopes: string;
};

export async function nylasAuthorizeGoogle(
  email: string,
  name: string,
  refresh_token: string
): Promise<NylasAuthorizeResponse> {
  const request: NylasAuthorizeRequest<NylasAuthorizeGoogleSetting> = {
    client_id: NYLAS_CLIENT_ID,
    provider: NylasProviders.GOOGLE,
    email_address: email,
    name,
    settings: {
      google_client_id: GOOGLE_CLIENT_ID,
      google_client_secret: GOOGLE_CLIENT_SECRET,
      google_refresh_token: refresh_token,
    },
    scopes: ["calendar"].join(","),
  };

  let res: NylasAuthorizeResponse;

  try {
    res = await apiRequest({
      url: `${NYLAS_ENDPOINT}/connect/authorize`,
      config: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}

export async function nylasConnectAccount(code: string): Promise<NylasAccount> {
  let request: NylasTokenRequest = {
    client_id: NYLAS_CLIENT_ID,
    client_secret: NYLAS_CLIENT_SECRET,
    code,
  };

  let res: NylasAccount;

  try {
    res = await apiRequest({
      url: `${NYLAS_ENDPOINT}/connect/token`,
      config: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}

export async function authNylasUser(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const isAdmin = state === "admin";

  if (!code) {
    throw Error("No code available in the url");
  }

  try {
    const googleToken = await getToken(code);
    const { email, name } = await getUserInfo(googleToken.access_token);

    const nylasAuthAccount = await nylasAuthorizeGoogle(
      email,
      name,
      googleToken.refresh_token
    );

    const nylasAccount = await nylasConnectAccount(nylasAuthAccount.code);
    const existingUser = await getUserByEmail(nylasAccount.email_address);
    if (existingUser) {
      await updateUserToken(
        nylasAccount.email_address,
        nylasAccount.access_token
      );
      return createUserSession({
        request,
        userId: existingUser.id,
        remember: false,
        redirectTo: isAdmin ? "/admin" : "/home",
      });
    }

    const user = await createUser({
      email: nylasAccount.email_address,
      accessToken: nylasAccount.access_token,
      accountId: nylasAccount.account_id,
      isAdmin,
    });

    return createUserSession({
      request,
      userId: user.id,
      remember: false,
      redirectTo: isAdmin ? "/admin" : "/home",
    });
  } catch (error: any) {
    throw Error(error);
  }
}
