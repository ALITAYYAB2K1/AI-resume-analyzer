import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
// @ts-ignore - runtime store provided via this declaration path
import { usePuterStore } from "types/puter.d.ts";

function ResumeCard({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const { fs } = usePuterStore();
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000 relative"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          {companyName && (
            <h2 className="text-black font-bold break-words">{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && <h2 className="!text-black">Resume</h2>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt={`resume`}
              className="w-full h-[350px] object-cover max-sm:h-[200px]"
            />
          </div>
        </div>
      )}
    </Link>
  );
}

export default ResumeCard;
