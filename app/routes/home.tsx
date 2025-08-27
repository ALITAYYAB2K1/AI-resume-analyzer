import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
// @ts-ignore - runtime store is provided from this declaration path in this project
import { usePuterStore } from "types/puter.d.ts";
import { Link } from "react-router";
// no hooks needed here
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "AI-powered resume analysis tool" },
  ];
}

export default function Home() {
  const { auth, fs, kv, isLoading } = usePuterStore();
  const [resumes, setResumes] = useState<(Resume & { kvKey?: string })[]>([]);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true);
  const [isWiping, setIsWiping] = useState<boolean>(false);
  const loadResumes = async () => {
    setLoadingResumes(true);
    const listResult = (await kv.list("resume:*", true)) as any[];
    const parsed: (Resume & { kvKey?: string })[] = [];
    if (Array.isArray(listResult) && listResult.length > 0) {
      if (typeof listResult[0] === "string") {
        // Only keys returned; fetch values
        for (const key of listResult as string[]) {
          try {
            const value = await kv.get(key);
            if (!value) continue;
            const resObj = JSON.parse(value) as Resume;
            if (resObj?.id) parsed.push({ ...resObj, kvKey: key });
          } catch {}
        }
      } else {
        // Expecting { key, value }
        for (const item of listResult as any[]) {
          try {
            const key = item?.key ?? item?.id ?? item?.Key;
            const value =
              typeof item?.value === "string"
                ? item.value
                : JSON.stringify(item?.value);
            const resObj = JSON.parse(value) as Resume;
            if (resObj?.id) parsed.push({ ...resObj, kvKey: key });
          } catch {}
        }
      }
    }
    setResumes(parsed);
    setLoadingResumes(false);
  };
  useEffect(() => {
    loadResumes();
  }, []);

  // Reload resumes when auth state changes
  useEffect(() => {
    loadResumes();
  }, [auth.isAuthenticated]);

  // single-card deletion disabled per request; handled via Wipe All only

  const handleWipeAll = async () => {
    const confirmDelete = window.confirm(
      "Wipe all resumes and data? This cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      setIsWiping(true);
      // Remove files referenced by current list first
      for (const r of resumes) {
        try {
          await fs.delete(r.resumePath);
        } catch {}
        try {
          await fs.delete(r.imagePath);
        } catch {}
      }
      // Flush KV to remove all resume:* keys decisively
      try {
        await kv.flush();
      } catch {}
      setResumes([]);
      // Ensure state reflects backend by reloading
      await loadResumes();
    } catch (err) {
      console.error("Failed to wipe all", err);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-1">
          <h1>Track Your Application & Resume Ratings</h1>
          {!loadingResumes ? (
            resumes?.length === 0 ? (
              <h2>
                No Resumes Found of yours here. Upload your resume to get
                feedback
              </h2>
            ) : (
              <h2>
                Review Your Own Resume and check AI-Powered Feedback and ATS
                score
              </h2>
            )
          ) : null}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}
        {!loadingResumes && resumes.length > 0 && (
          <>
            <div className="flex justify-center my-2">
              <button
                type="button"
                onClick={handleWipeAll}
                disabled={isWiping}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 cursor-pointer text-white text-base font-semibold px-6 py-3 rounded-lg shadow"
                title="Delete all resumes and data"
              >
                {isWiping ? "Wiping..." : "Wipe All"}
              </button>
            </div>
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume as unknown as Resume}
                />
              ))}
            </div>
          </>
        )}
        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
