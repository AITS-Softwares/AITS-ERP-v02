function extractFileName(disposition, fallbackName) {
  const match = disposition?.match(/filename=([^;]+)/i);
  if (!match) return fallbackName;
  return match[1].replace(/["']/g, "").trim() || fallbackName;
}

export async function downloadDistributorFile(path, fallbackName) {
  const token = typeof window !== "undefined" ? localStorage.getItem("distributor_token") || "" : "";
  const res = await fetch(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.message || "Download failed");
  }

  const blob = await res.blob();
  const fileName = extractFileName(res.headers.get("Content-Disposition"), fallbackName);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
