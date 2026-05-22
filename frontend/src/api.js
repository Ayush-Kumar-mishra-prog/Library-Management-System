const API_BASE =
  "http://localhost/Library%20Management%20System/backend/index.php";
const BACKEND_BASE = "http://localhost/Library%20Management%20System/backend";

export function getToken() {
  return localStorage.getItem("token") || "";
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      raw.startsWith("<")
        ? "Server Error"
        : "Request failed",
    );
  }
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function apiUpload(path, formData) {
  const token = getToken();
  const response = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      raw.startsWith("<")
        ? "Server Error"
        : "Upload failed",
    );
  }
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

export function toPublicFileUrl(relativePath) {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `${BACKEND_BASE}/${relativePath.replace(/^\/+/, "")}`;
}
