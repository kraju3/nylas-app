import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs, TypedResponse } from "@remix-run/server-runtime";
import { getLabelsOrFolders, Label } from "~/models/message/message.server";
import { getUser } from "~/session.server";

export async function loader({
  request,
}: LoaderArgs): Promise<TypedResponse<{ folders: Label }>> {
  const user = await getUser(request);
  if (!user) {
    return json({
      folders: [],
    });
  }
  return json({
    folders: await getLabelsOrFolders<Label>("labels", user),
  });
}

export default function Message() {
  const { folders } = useLoaderData();
  return (
    <div className="container mt-5 flex w-full flex-row shadow-lg">
      <div className="drawer mb-5">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer" className="drawer-button btn btn bg-black">
            Folders
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <ul className="menu w-80 bg-base-100 p-4 text-base-content">
            {folders.map((folder: any, index: number) => {
              return (
                <li>
                  <Link to={`/home/message/folders/${folder.name}`}>
                    {folder.display_name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
