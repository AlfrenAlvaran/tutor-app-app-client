export function toDownloadUrl(fileUrl: string, fileName?: string | null): string {
  if (!fileUrl) return fileUrl;
 
  const flag = fileName
    ? `fl_attachment:${encodeURIComponent(fileName.replace(/\.[^/.]+$/, ""))}`
    : "fl_attachment";
 
  return fileUrl.replace("/upload/", `/upload/${flag}/`);
}
 