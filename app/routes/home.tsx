import { Link, Outlet } from "@remix-run/react";
import { useUser } from "~/utils";

export default function Home() {
  const user = useUser();
  return (
    <div className="mt-1 w-full md:container md:mx-auto">
      <div className="... container navbar w-full rounded-lg bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn-ghost btn lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li>
                <Link to="/home/message">Messages</Link>
              </li>
              <li tabIndex={0}>
                <Link to="/home/events" className="justify-between">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/home/contacts">Contacts</Link>
              </li>
            </ul>
          </div>
          <Link to="/home" className="btn-ghost btn text-xl normal-case">
            Nylas
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/home/message">Messages</Link>
            </li>
            <li tabIndex={0}>
              <Link to="/home/events" className="justify-between">
                Events
              </Link>
            </li>
            <li>
              <Link to="/home/contacts">Contacts</Link>
            </li>
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
