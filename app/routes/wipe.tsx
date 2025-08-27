import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
// @ts-ignore - runtime store provided via this declaration path
import { usePuterStore } from "types/puter.d.ts";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as any[];
    setFiles(files || []);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Wipe all app data (files + KV)? This cannot be undone."
    );
    if (!confirmDelete) return;
    for (const file of files) {
      try {
        await fs.delete(file.path);
      } catch {}
    }
    try {
      await kv.flush();
    } catch {}
    await loadFiles();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  return (
    <main className="main-section">
      <nav className="resume-nav mb-6">
        <Link to={"/"} className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>
      <h1 className="text-2xl font-bold text-black mb-4">Wipe App Data</h1>
      <p className="text-gray-600 mb-6">
        Authenticated as:{" "}
        <span className="font-semibold">{auth.user?.username}</span>
      </p>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Existing files</h2>
        {files.length === 0 ? (
          <p className="text-gray-600">No files found.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {files.map((file, idx) => (
              <li key={file.id ?? idx} className="text-gray-800 break-words">
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md cursor-pointer shadow"
          onClick={handleDelete}
        >
          Wipe All Data
        </button>
        <Link to="/" className="secondary-button">
          Back to Home
        </Link>
      </div>
    </main>
  );
};

export default WipeApp;
