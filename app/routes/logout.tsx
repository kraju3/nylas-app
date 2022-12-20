import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { logout } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  return logout(request);
}
