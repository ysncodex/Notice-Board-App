import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000,
});

export const FALLBACK_DEPARTMENTS_OR_INDIVIDUAL = [
  "All Department",
  "Finance",
  "Sales Team",
  "Web Team",
  "Database Team",
  "Admin",
  "Individual",
  "HR",
];

export const FALLBACK_NOTICE_TYPES = [
  "Warning / Disciplinary",
  "Performance Improvement",
  "Appreciation / Recognition",
  "Attendance / Leave Issue",
  "Payroll / Compensation",
  "Contract / Role Update",
  "Advisory / Personal Reminder",
];

export async function fetchMeta() {
  const { data } = await api.get("/api/meta");
  return data;
}

export async function createNotice(payload) {
  const { data } = await api.post("/api/notices", payload);
  return data;
}

export async function updateNotice(id, payload) {
  const { data } = await api.put(`/api/notices/${id}`, payload);
  return data;
}

export async function fetchNotices(params) {
  const { data } = await api.get("/api/notices", { params });
  return data;
}

export async function fetchNoticeById(id) {
  const { data } = await api.get(`/api/notices/${id}`);
  return data;
}

export async function updateNoticeStatus(id, status) {
  const { data } = await api.patch(`/api/notices/${id}/status`, { status });
  return data;
}

export async function uploadAttachments(files) {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  const { data } = await api.post("/api/uploads", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
