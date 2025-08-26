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
  const { auth, fs, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true);
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const kvItems = (await kv.list("resume:*", true)) as any[];
      const parsedResumes = kvItems
        ?.map((item: any) => {
          try {
            return JSON.parse(item?.value) as Resume;
          } catch {
            return undefined;
          }
        })
        .filter(Boolean) as Resume[];
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
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
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
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
