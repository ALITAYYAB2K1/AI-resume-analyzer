import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Convert a size in bytes to a human-readable string in KB, MB, or GB
function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 KB";

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : kb >= 10 ? 1 : 2)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb >= 100 ? 0 : mb >= 10 ? 1 : 2)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(gb >= 100 ? 0 : gb >= 10 ? 1 : 2)} GB`;
}
interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}
function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      setSelectedFile(file);
      onFileSelect?.(file);
    },
    [onFileSelect]
  );
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 20 * 1024 * 1024, // 20 MB
  });
  const file = selectedFile;

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          {file ? (
            <div
              className="uploader-selected-file"
              onClick={(e) => e.stopPropagation()}
            >
              <img src="/images/pdf.png" alt="pdf" className="size-10" />
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="p-2 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedFile(null);
                  onFileSelect?.(null);
                }}
              >
                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-2">
                <img src="/icons/info.svg" alt="upload" className="size-20" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to Upload</span> or drag
                and drop
              </p>
              <p className="text-sm text-gray-400">
                Supported formats: PDF (max 20 MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploader;
