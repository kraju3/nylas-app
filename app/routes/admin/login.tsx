import { ActionArgs } from "@remix-run/server-runtime";
import { getUserByEmail } from "~/models/user.server";
import { createUserSession } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();

  const adminTestUser = await getUserByEmail("admin@remix.run");
  console.log(adminTestUser);
  if (request.method !== "POST" || !adminTestUser) {
    throw Error("Only post method allowed");
  }

  return await createUserSession({
    request,
    userId: adminTestUser?.id,
    remember: false,
    redirectTo: "/admin",
  });
}
