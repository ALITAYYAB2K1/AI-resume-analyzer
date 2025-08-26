import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
// @ts-ignore - this project provides a runtime store from this path
import { usePuterStore } from "types/puter.d.ts";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
export function meta() {
  return [
    { title: "Resumind | Review" },
    { name: "description", content: "Detail review of your resume" },
  ];
}
const resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  useEffect(() => {
    if (!auth.isAuthenticated && !isLoading) {
      navigate(`/auth?next=/resume/${id}`);
      return;
    }
    const loadResume = async () => {
      try {
        const stored = await kv.get(`resume:${id}`);
        if (!stored) return;
        const data = JSON.parse(stored);

        // Read PDF and image from Puter FS
        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          setResumeUrl(URL.createObjectURL(pdfBlob));
        }

        const imageBlob = await fs.read(data.imagePath);
        if (imageBlob) {
          setImageUrl(URL.createObjectURL(imageBlob));
        }

        setFeedback(data.feedback);
        console.log("Loaded resume", { id, data });
      } catch (e) {
        console.error("Failed to load resume", e);
      }
    };
    loadResume();
  }, [id, auth.isAuthenticated, isLoading]);

  // Revoke image URL when it changes or on unmount to prevent memory leaks.
  // Intentionally do NOT revoke resumeUrl to avoid breaking the link opened in a new tab.
  useEffect(() => {
    return () => {
      try {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      } catch {}
    };
  }, [imageUrl]);
  return (
    <main className="pt-0">
      <nav className="resume-nav">
        <Link to={"/"} className="back-button">
          <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
              {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    title="resume"
                    alt="Resume preview"
                  />
                </a>
              ) : (
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                  alt="Resume preview"
                />
              )}
            </div>
          )}
        </section>
        <section className="feedback-section">
          <h2 className="text-3xl text-black font-bold">Resume Review</h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              Summary ATS Details
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img src="/images/resume-scan-2.gif" className="w-full" />
          )}
        </section>
      </div>
    </main>
  );
};

export default resume;
