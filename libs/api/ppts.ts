const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export type PptProgram = { id: string; label: string | null } | null;

export type Ppt = {
  id: string;
  title: string;
  lesson: string;
  description: string;
  fileUrl: string | null;
  fileName: string | null;
  program: PptProgram;
  tutor: string;
  createdAt: string;
};

type PptsListResponse = { success: boolean; ppts: Ppt[] };
type PptResponse = { success: boolean; message?: string; ppt: Ppt };

async function readErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.message ?? fallback;
}

export async function getPpts(programId?: string): Promise<Ppt[]> {
  const url = new URL(`${API_BASE}/module/ppts`);
  if (programId) url.searchParams.set("programId", programId);

  const res = await fetch(url.toString(), {
    credentials: "include", // send the httpOnly auth cookie cross-origin
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Failed to load PPTs (${res.status})`));
  }

  const json: PptsListResponse = await res.json();
  return json.ppts;
}

export async function createPpt(formData: FormData): Promise<Ppt> {
  const res = await fetch(`${API_BASE}/module/ppts`, {
    method: "POST",
    credentials: "include",
    body: formData, // browser sets the multipart boundary header itself
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Failed to add PPT (${res.status})`));
  }

  const json: PptResponse = await res.json();
  return json.ppt;
}

export async function deletePpt(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/module/ppts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, `Failed to delete PPT (${res.status})`));
  }
}