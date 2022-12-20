import { Form } from "@remix-run/react";

export default function AdminHome() {
  return (
    <div className="md:container md:mx-auto">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="https://www.pngitem.com/pimgs/m/302-3024186_reload-process-loading-settings-option-configuration-transparent-admin.png"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">Welcome to Admin Center!</h1>
            <p className="py-6">View Users and Create Pages</p>
            <Form action="/admin/scheduler" method="get">
              <button type="submit" className="btn">
                Create Page
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
