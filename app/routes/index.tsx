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
    return redirect(user.admin ? "/admin" : "/home");
  }
  const SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar",
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
  const [isAdmin, setAdmin] = useState<boolean>(true);
  const data = useLoaderData();

  useEffect(() => {
    if (window.google) {
      const oAuth2Client = window.google.accounts.oauth2.initCodeClient({
        ...data,
        state: isAdmin ? "admin" : "user",
      });
      setOAuthClient(oAuth2Client);
    }
  }, [setOAuthClient, isAdmin]);

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Login</h1>
            <p className="py-6">{""}</p>
          </div>
          <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
            <div className="card-body">
              <div className="flex min-h-full flex-col justify-center">
                <div className="mx-auto w-full max-w-md px-8">
                  <GoogleButton
                    type="light"
                    onClick={(e) => {
                      oAuthClient?.requestCode();
                    }}
                  ></GoogleButton>
                </div>
                <div className="mx-auto mt-5 w-full px-8">
                  <label className="label cursor-pointer">
                    <span className="badge badge-outline label-text">
                      Admin
                    </span>
                    <input
                      onChange={(e) => setAdmin((val) => !val)}
                      type="checkbox"
                      className="sm:0 toggle"
                      checked={isAdmin}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
