import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { getThreads, Thread } from "~/models/message/message.server";

type LoaderData = {
  threads: Awaited<ReturnType<typeof getThreads>>;
};

type ThreadProps = {
  thread: Thread;
};

export async function loader({ request, params }: LoaderArgs) {
  const folderName = params.folderName;
  console.log(folderName);
  return json<LoaderData>({
    threads: await getThreads(request, {
      in: folderName,
    }),
  });
}

function ThreadComponent({ thread }: ThreadProps) {
  return (
    <div className="neutral-content card m-5 w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title overflow-hidden text-ellipsis">
          {thread.subject}
          {thread.unread && (
            <div className="badge-secondary badge bg-red-600">{"Unread"}</div>
          )}
        </h2>
        <p className={"overflow-hidden text-ellipsis"}>{thread.snippet}</p>
        <div className="card-actions justify-end">
          <div className="badge-outline badge">Fashion</div>
          <div className="badge-outline badge">Products</div>
        </div>
      </div>
    </div>
  );
}

export default function Folder() {
  const { threads } = useLoaderData() as LoaderData;
  return (
    <div className="center flex w-full flex-wrap justify-center md:container md:mx-auto">
      {threads.map((thread) => (
        <ThreadComponent thread={thread} />
      ))}
    </div>
  );
}
