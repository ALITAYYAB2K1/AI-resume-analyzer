import React, { useEffect, useState, type FormEvent } from "react";
import Navbar from "~/components/Navbar";
// @ts-ignore - implementation is provided in this declaration file in this project
import { usePuterStore } from "types/puter.d.ts";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";

function upload() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/auth?next=/upload");
    }
  }, [auth.isAuthenticated]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Upload your resume to get started"
  );
  const [file, setFile] = useState<File | null>(null);
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusText("Processing...");
    // Simulate file upload
    setTimeout(() => {
      setIsProcessing(false);
      setStatusText("Upload complete");
    }, 2000);
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Smart feedback from your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <>
              <h2>Drop your resumes for an ATS score and improvement tips</h2>
            </>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" id="company-name" name="company-name" />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job title</label>
                <input type="text" id="job-title" name="job-title" />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  id="job-description"
                  name="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default upload;
