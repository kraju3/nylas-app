import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import GoogleButton from "react-google-button";

declare global {
  interface Window {
    google: any;
  }
}
const handleGoogleSignIn = async (data: any) => {
  try {
    /*
			Here you will communicate with your backend to get a Nylas Access token. First you would need to use
tthis code to retrieve an access_token and refresh token from Google

*/
    console.log(data);

    //logic to call the backend to send the code which will retrieve the access_token and referesh token to send to authorize then /connect/token
  } catch (error) {
    console.log(error);
  }
};

export async function loader() {
  const SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/contacts",
    "https://mail.google.com/",
  ];
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  return json({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES.join(" "),
    access_type: "offline",
    ux_mode: "redirect",
    callback: handleGoogleSignIn,
    redirect_uri: "http://localhost:3000/callback",
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

interface OAuthClient {
  requestCode: () => void;
}

export default function LoginPage() {
  const [oAuthClient, setOAuthClient] = useState<OAuthClient>();
  const data = useLoaderData();
  useEffect(() => {
    if (window.google) {
      const oAuth2Client = window.google.accounts.oauth2.initCodeClient(data);
      setOAuthClient(oAuth2Client);
    }
  }, [setOAuthClient]);

  return (
    <>
      <script src="https://accounts.google.com/gsi/client"></script>
      <div className="flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-8">
          <GoogleButton
            type="light"
            onClick={(e) => {
              oAuthClient?.requestCode();
            }}
          ></GoogleButton>
        </div>
      </div>
    </>
  );
}
