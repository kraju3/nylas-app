import { Form } from "@remix-run/react";

export default function Meeting() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Select Meeting Type</h1>
          <p className="py-6">Company or Freelancer</p>
        </div>
        <div className="card w-full max-w-sm flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <div className="card  bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://www.clipartmax.com/png/middle/43-431146_company-factsheet-people-icon-blue-png.png"
                  alt="Shoes"
                />
              </figure>
              <Form method="get" action="/scheduler">
                <div className="card-body">
                  <h2 className="card-title">Company Hiring</h2>
                  <div className="card-actions justify-end">
                    <input
                      hidden
                      name="type"
                      defaultValue="company"
                      type="text"
                    />
                    <button type="submit" className="btn-accent btn">
                      Book
                    </button>
                  </div>
                </div>
              </Form>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://www.nicepng.com/png/detail/428-4280526_expert-png.png"
                  alt="Shoes"
                />
              </figure>
              <Form method="get" action="/scheduler">
                <div className="card-body">
                  <h2 className="card-title">Meet with an Expert</h2>
                  <div className="card-actions justify-end">
                    <input hidden name="type" defaultValue="1:1" type="text" />
                    <button type="submit" className="btn-accent btn">
                      Book
                    </button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
