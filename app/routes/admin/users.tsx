import { Page, User } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, redirect } from "@remix-run/server-runtime";
import { deleteSchedulerPage } from "~/models/admin/scheduler.server";
import { getSchedulerPages } from "~/models/page.server";
import { getUsers } from "~/models/user.server";

type LoaderData = {
  users: Awaited<ReturnType<typeof getUsers>>;
  pages: Awaited<ReturnType<typeof getSchedulerPages>>;
};

type UserProps = {
  user: User;
};

type SchedulerProps = {
  page: Partial<Page>;
};

export async function action({ request }: ActionArgs) {
  const url = new URL(request.url);

  const deleteScheduler = Boolean(url.searchParams.get("deleteScheduler"));

  if (deleteScheduler) {
    const body = await request.formData();
    //   const project = await createProject(body);
    //   return redirect(`/projects/${project.id}`);
    const slug = body.get("page_slug") as string;
    await deleteSchedulerPage(slug);
  }

  return redirect("/admin/users");
}

export async function loader() {
  return json<LoaderData>({
    users: await getUsers(),
    pages: await getSchedulerPages(),
  });
}

function UserComponent({ user }: UserProps) {
  return (
    <div className="neutral-content card m-5 w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title overflow-hidden text-ellipsis">
          {user.email}
        </h2>
        <p className={"overflow-hidden text-ellipsis"}>{user.accountId}</p>
        <div className="card-actions justify-end">
          <div className="placeholder avatar">
            <div className="w-24 rounded-full bg-neutral-focus text-neutral-content">
              <span className="text-3xl">{user.email[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function PageComponent({ page }: SchedulerProps) {
  return (
    <div className="neutral-content card m-5 w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title overflow-hidden text-ellipsis">
          {page.pageSlug}
        </h2>
        <div className="card-actions justify-end">
          <div className="placeholder avatar">
            <Form action="/admin/redirect" method="post">
              <input hidden value={page.pageSlug} name="page_slug" />
              <button type="submit" className="btn-outline btn">
                View
              </button>
            </Form>
            <Form
              className="ml-2"
              action="/admin/users?deleteScheduler=true"
              method="post"
            >
              <input hidden value={page.pageSlug} name="page_slug" />
              <button type="submit" className="btn-outline btn">
                Delete
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPortal() {
  const { users, pages } = useLoaderData() as unknown as LoaderData;
  return (
    <>
      <div className="center flex w-full flex-wrap justify-center md:container md:mx-auto">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        {users.map((user) => (
          <UserComponent key={user.accountId} user={user} />
        ))}
      </div>
      <div className="divider"></div>
      <div className="center flex w-full flex-wrap justify-center md:container md:mx-auto">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold">Pages</h2>
        </div>
        {pages.map((page) => (
          <PageComponent key={page.pageSlug} page={page} />
        ))}
      </div>
    </>
  );
}
