import React, { useState, type FormEvent } from "react";
import Navbar from "~/components/Navbar";

function upload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState(
    "Upload your resume to get started"
  );
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
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  required
                />
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default upload;
