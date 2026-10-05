const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const FILE_BASE_URL =
  API.replace(/\/api\/?$/, "");

export async function api(path, options = {}) {
  const token =
    localStorage.getItem("internship_token");

  const isFormData =
    options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API}${path}`,
    {
      ...options,
      headers,
    }
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "เกิดข้อผิดพลาดในการเชื่อมต่อ Server"
    );
  }

  return data;
}

export default api;