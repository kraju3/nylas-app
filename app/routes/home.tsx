import { Link, Outlet } from "@remix-run/react";
import { useUser } from "~/utils";

export default function Home() {
  const user = useUser();
  return (
    <div className="mt-1 w-full md:container md:mx-auto">
      <div className="... container navbar w-full rounded-lg bg-base-100 shadow-lg">
        <div className="navbar-start">
          <Link to="/home" className="btn-ghost btn text-xl normal-case">
            Nylas
          </Link>
        </div>
        <div className="navbar-end">
          <Link to="/logout" className="btn">
            Logout
          </Link>
        </div>
      </div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img
            alt="Thank you for connecting"
            src="https://t4.ftcdn.net/jpg/03/29/44/25/360_F_329442520_bs9DE1vhchdtXtbsJXcwGQTpjZd5NzDo.jpg"
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">
              Thank you for Connecting your Account!
            </h1>
            <p className="py-6">
              Admin will be able to create pages for these users now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
