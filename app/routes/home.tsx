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
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <Link
              to="/home/appointments"
              className="btn-ghost btn text-xl normal-case"
            >
              Appointments
            </Link>
          </ul>
        </div>
        <div className="navbar-end">
          <Link to="/logout" className="btn">
            Logout
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
