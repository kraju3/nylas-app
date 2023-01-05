import { ActionArgs, redirect } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  //   const project = await createProject(body);
  //   return redirect(`/projects/${project.id}`);
  const slug = body.get("page_slug") as string;
  const pageUrl = `${process.env.SCHEDULER_WEB}/${slug}`;
  return redirect(pageUrl);
}
