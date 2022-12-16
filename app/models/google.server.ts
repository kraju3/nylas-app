import { apiRequest } from "./api.server";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USER_INFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

type GoogleTokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token: string;
};

type GoogleUserResponse = {
  email: string;
  name: string;
};

export async function getToken(code: string): Promise<GoogleTokenResponse> {
  let res: GoogleTokenResponse;
  try {
    res = await apiRequest({
      url: TOKEN_ENDPOINT,
      config: {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_id=${GOOGLE_CLIENT_ID}&client_secret=${GOOGLE_CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${GOOGLE_REDIRECT_URI}`,
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}

export async function getUserInfo(token: string): Promise<GoogleUserResponse> {
  let res: GoogleUserResponse;

  try {
    res = await apiRequest({
      url: USER_INFO_ENDPOINT,
      config: {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } catch (error: any) {
    throw Error(error);
  }
  return res;
}
