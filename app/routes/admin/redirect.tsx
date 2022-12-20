import { ActionArgs, redirect } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  //   const project = await createProject(body);
  //   return redirect(`/projects/${project.id}`);
  const url = body.get("redirect_url") as string;
  return redirect(url);
}
