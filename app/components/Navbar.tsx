import React from "react";
import { Link, useNavigate } from "react-router";
// @ts-ignore - runtime store provided via this declaration path
import { usePuterStore } from "types/puter.d.ts";
import { hardLogout } from "~/lib/hardLogout";

function Navbar() {
  const { auth, isLoading } = usePuterStore();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="font-bold text-2xl text-gradient">RESUMIND</p>
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/upload">
          <p className="primary-button w-fit whitespace-nowrap">
            Upload Resume
          </p>
        </Link>
        {auth.isAuthenticated ? (
          <button
            type="button"
            onClick={async () => {
              await hardLogout(auth);
            }}
            disabled={isLoading}
            className="primary-button !bg-red-600 hover:!bg-red-700 !bg-none disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            title="Sign out"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              try {
                auth.signIn();
              } catch {}
            }}
            disabled={isLoading}
            className="primary-button !bg-green-600 hover:!bg-green-700 !bg-none disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            title="Sign in"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
