import { Form } from "@remix-run/react";
import { ActionArgs, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { getUser } from "~/session.server";
import { generateQueryString } from "~/utils";

export async function action({ request }: ActionArgs) {
  const user = await getUser(request);

  if (!user || user.admin) {
    throw new Error("Admin don't have access to this pages");
  }

  const queryParams = {
    redirect_uri: "http://localhost:3000/zoom/redirect",
    client_id: process.env.ZOOM_CLIENT_ID,
    state: user.id,
    response_type: "code",
  };

  const queryUrl = generateQueryString(queryParams);
  const zoomurl = `https://zoom.us/oauth/authorize?${queryUrl}`;

  return redirect(zoomurl);
}

export default function Zoom() {
  return (
    <div className="container md:mx-auto">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="https://zeevector.com/wp-content/uploads/2021/03/Zoom-Logo-white.png"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">Integrate with Zoom</h1>
            <p className="py-6"></p>
            <Form method="post" action="/zoom">
              <button type="submit" className="btn bg-blue-600">
                Sign In with Zoom
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
