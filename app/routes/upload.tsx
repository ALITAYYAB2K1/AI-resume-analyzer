import React, { useEffect, useState, type FormEvent } from "react";
import Navbar from "~/components/Navbar";
// @ts-ignore - implementation is provided in this declaration file in this project
import { usePuterStore } from "types/puter.d.ts";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import { convertPdfToImage } from "~/lib/Pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

// Small helper to avoid hanging on slow network calls.
// Accepts undefined and returns immediately with fallback to avoid runtime errors.
function withTimeout<T>(
  promise: Promise<T> | undefined,
  ms = 2000,
  fallback?: T
): Promise<T | undefined> {
  if (!promise || typeof (promise as any).finally !== "function") {
    return Promise.resolve(fallback as T);
  }
  let timer: any;
  return Promise.race([
    (promise as Promise<T>).finally(() => clearTimeout(timer)),
    new Promise<T>(
      (resolve) => (timer = setTimeout(() => resolve(fallback as T), ms))
    ),
  ]);
}

function upload() {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
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
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File | null;
  }) => {
    if (!file) return;
    setIsProcessing(true);
    setStatusText("Processing...");

    const uploadedPdf = await fs.upload([file]);
    if (!uploadedPdf)
      return setStatusText("File upload failed, please try again.");
    setStatusText("Converting to image....");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile || imageFile.error)
      return setStatusText(
        imageFile?.error || "File conversion failed, please try again."
      );
    setStatusText("Uploading image...");
    const imageToUpload = imageFile.file;
    if (!imageToUpload)
      return setStatusText("Image conversion failed, please try again.");
    const uploadedImage = await fs.upload([imageToUpload]);
    if (!uploadedImage)
      return setStatusText("Image upload failed, please try again.");
    setStatusText("preparing data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedPdf.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    // Don't block the UI on KV writes; guard sync throws
    try {
      void withTimeout(
        kv.set(`resume:${uuid}`, JSON.stringify(data)),
        1500
      ).catch(() => {});
    } catch {}
    setStatusText("Analyzing...");
    try {
      const feedback = await ai.feedback(
        uploadedPdf.path,
        prepareInstructions({
          jobTitle,
          jobDescription,
        })
      );
      if (!feedback) return setStatusText("Analysis failed, please try again.");
      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;
      data.feedback = JSON.parse(feedbackText);
      try {
        void withTimeout(
          kv.set(`resume:${uuid}`, JSON.stringify(data)),
          1500
        ).catch(() => {});
      } catch {}
    } catch (err) {
      console.error("AI feedback error", err);
      return setStatusText("Analysis failed, please try again.");
    }
    setStatusText("Analysis complete.");
    navigate(`/resume/${uuid}`);
    setTimeout(() => {
      setIsProcessing(false);
    }, 800);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;
    if (!file) return;
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
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
