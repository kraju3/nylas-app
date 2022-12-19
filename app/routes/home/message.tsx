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
    <>
      <div className="dropdown dropdown-end mt-5 p-0">
        <label tabIndex={0} className="btn m-1 shadow-lg">
          Folders
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
        >
          {folders.map((folder: any, index: number) => {
            return (
              <li key={index.toString()}>
                <Link
                  key={index.toString()}
                  to={`/home/message/folders/${folder.name}`}
                >
                  {folder.display_name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <Outlet />
    </>
  );
}
