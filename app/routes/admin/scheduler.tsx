import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { createNylasSchedulerPage } from "~/models/admin/scheduler.server";
import { SchedulerPageType } from "~/models/page.server";
import { getUsers } from "~/models/user.server";

type LoaderData = {
  users: Awaited<ReturnType<typeof getUsers>>;
};

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  //   const project = await createProject(body);
  //   return redirect(`/projects/${project.id}`);
  const radioFields: string[] = [];
  body.forEach((value, key) => {
    if (key.includes("radio-Experts")) {
      radioFields.push(key);
    }
  });
  return await createNylasSchedulerPage(body, radioFields);
}

export async function loader({ request }: LoaderArgs) {
  return json({
    users: await getUsers(),
  });
}

type TextFieldProps = {
  value?: string;
  placeholder: string;
  fieldName: string;
  inputName: string;
  type?: string;
};

type SelectdProps = {
  fieldName: string;
  inputName: string;
  options: {
    value: string;
    name: string;
  }[];
};

const TextField = ({
  inputName,
  type,
  placeholder,
  fieldName,
}: TextFieldProps) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="badge badge-outline  label-text">{fieldName}</span>
      </label>
      <input
        name={inputName}
        type={type || "text"}
        placeholder={placeholder}
        className="input-bordered input w-full max-w-xs"
      />
    </div>
  );
};

type RadioFieldProps = {
  fieldName: string;
  radios: string[];
};

const RadioField = ({ radios, fieldName }: RadioFieldProps) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="badge badge-outline  label-text">{fieldName}</span>
      </label>
      {radios.map((radio, index) => {
        return (
          <>
            <input
              key={radio}
              type="radio"
              name={`radio-${fieldName}-${index}`}
              value={radio}
              className="radio"
            />
            <span key={radio} className="label-text">
              {radio}
            </span>
          </>
        );
      })}
    </div>
  );
};

const SelectField = ({ fieldName, options, inputName }: SelectdProps) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="text- label">
        <span className="badge badge-outline label-text">{fieldName}</span>
      </label>
      <select name={inputName} className="select-bordered select">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function Scheduler() {
  const { users } = useLoaderData() as unknown as LoaderData;
  const actionData = useActionData<typeof action>();
  console.log(SchedulerPageType);
  return (
    <div className="flex flex-col md:container md:mx-auto ">
      <Form method="post">
        <TextField
          placeholder="Scheduler Page Name"
          inputName={"name"}
          fieldName={"Page Name"}
        />
        <TextField
          placeholder="Scheduler Page Slug"
          inputName={"slug"}
          fieldName={"Page Slug"}
        />
        <TextField
          placeholder="Event Name"
          inputName={"title"}
          fieldName={"Event Title"}
        />
        <SelectField
          fieldName="Scheduling Method"
          inputName="scheduling_method"
          options={[
            {
              name: "Round Robin Maximum Availability",
              value: "round-robin-maximize-availability",
            },
            {
              name: "Round Robin Maximum Fairness",
              value: "round-robin-maximize-round-robin-maximize-fairness",
            },
          ]}
        />
        <SelectField
          fieldName="Scheduling Purpose"
          inputName="scheduling_purpose"
          options={[
            {
              name: "Company",
              value: "company",
            },
            {
              name: "One to One",
              value: "1:1",
            },
          ]}
        />
        <RadioField
          fieldName="Experts"
          radios={users.map((user) => user.email)}
        />

        <button type="submit" className="btn mt-1">
          Create
        </button>
      </Form>
    </div>
  );
}
