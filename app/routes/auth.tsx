import { useEffect, useState } from "react";
// @ts-ignore - runtime store provided via this path in this project
import { usePuterStore } from "types/puter.d.ts";
import { useLocation, useNavigate } from "react-router";
import { hardLogout } from "~/lib/hardLogout";
export function meta() {
  return [
    { title: "Resumind | Auth" },
    { name: "description", content: "Log into your account" },
  ];
}

export default function Auth() {
  const { isLoading, auth } = usePuterStore();
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const next = location.search.split("next=")[1] || "/";
  const navigate = useNavigate();
  useEffect(() => {
    // Don't auto-redirect while we're in the middle of signing out
    if (auth.isAuthenticated && !signingOut) {
      navigate(next);
    }
  }, [auth.isAuthenticated, next, signingOut]);
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center text-center gap-2">
            <h1>Welcome to Resumind</h1>
            <h2>Log In to continue your journey</h2>
          </div>
          <div>
            {isLoading ? (
              <button className="auth-button animate-pulse">
                <p>Signing you in....</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button
                    className="auth-button disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={signingOut}
                    onClick={async () => {
                      setSigningOut(true);
                      await hardLogout(auth);
                    }}
                  >
                    <p>{signingOut ? "Logging out..." : "Log Out"}</p>
                  </button>
                ) : (
                  <button className="auth-button" onClick={() => auth.signIn()}>
                    <p>Log In</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
