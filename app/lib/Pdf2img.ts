export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = Promise.all([
    import("pdfjs-dist"),
    // Let Vite give us the URL for the installed worker version
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
  ]).then(([mod, workerUrl]: any[]) => {
    const GlobalWorkerOptions =
      mod.GlobalWorkerOptions ?? mod.default?.GlobalWorkerOptions;
    const getDocument = mod.getDocument ?? mod.default?.getDocument;

    // Set the worker source to use local file (served from /public)
    if (GlobalWorkerOptions) {
      try {
        GlobalWorkerOptions.workerSrc =
          workerUrl?.default ?? "/pdf.worker.min.mjs";
      } catch {}
    }

    pdfjsLib = { getDocument, GlobalWorkerOptions };
    isLoading = false;
    return pdfjsLib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    // Deep-copy into a new buffer to avoid "detached ArrayBuffer" issues
    const srcView = new Uint8Array(arrayBuffer);
    const data = new Uint8Array(srcView); // copies bytes into a fresh buffer
    const pdf = await lib.getDocument({ data, disableWorker: true }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get 2D context for canvas",
      };
    }

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob from canvas",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
