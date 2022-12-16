import { LoaderArgs, MetaFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import GoogleButton from "react-google-button";
import { getUser } from "~/session.server";

declare global {
  interface Window {
    google: any;
  }
}

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect("/home");
  }
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
