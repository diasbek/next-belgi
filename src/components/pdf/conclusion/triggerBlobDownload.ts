/**
 * Save a blob as a file download; on capable mobile browsers prefer the share sheet.
 */
export async function triggerBlobDownload(
  blob: Blob,
  fileName: string,
  mime = blob.type || "application/octet-stream",
): Promise<void> {
  const file = new File([blob], fileName, { type: mime });

  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] }) &&
      typeof navigator.share === "function" &&
      (window.matchMedia("(max-width: 767px)").matches ||
        window.matchMedia("(pointer: coarse)").matches)
    ) {
      await navigator.share({ files: [file], title: fileName });
      return;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
