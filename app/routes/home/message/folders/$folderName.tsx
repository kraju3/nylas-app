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
      unread: true,
    }),
  });
}

function ThreadComponent({ thread }: ThreadProps) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          {thread.subject}
          <div className="badge-secondary badge">{"Unread"}</div>
        </h2>
        <p>{thread.snippet}</p>
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
    <div className="container md:mx-auto">
      {threads.map((thread) => (
        <ThreadComponent thread={thread} />
      ))}
    </div>
  );
}
