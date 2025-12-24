import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FALLBACK_DEPARTMENTS_OR_INDIVIDUAL,
  FALLBACK_NOTICE_TYPES,
  createNotice,
  fetchMeta,
  fetchNoticeById,
  updateNotice,
  uploadAttachments,
} from "../api";
import {
  Button,
  FileDropzone,
  Input,
  Modal,
  MultiSelectDropdown,
  Select,
} from "../components/ui";

function isIndividual(targetAudience) {
  return (
    String(targetAudience || "")
      .trim()
      .toLowerCase() === "individual"
  );
}

function dateOnlyToLocalDate(value) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map((v) => Number.parseInt(v, 10));
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function dateToInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function CreateNotice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [noticeTypes, setNoticeTypes] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const [form, setForm] = useState({
    targetAudience: "",
    title: "",
    employeeId: "",
    employeeName: "",
    position: "",
    noticeType: [],
    publishDate: "",
    body: "",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(null);

  async function loadMeta() {
    setMetaLoading(true);
    setMetaError("");
    try {
      const data = await fetchMeta();
      setDepartments(
        data.departmentsOrIndividual || FALLBACK_DEPARTMENTS_OR_INDIVIDUAL
      );
      setNoticeTypes(data.noticeTypes || FALLBACK_NOTICE_TYPES);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dropdown data from API. Using fallback values.";
      setMetaError(msg);
      setDepartments(FALLBACK_DEPARTMENTS_OR_INDIVIDUAL);
      setNoticeTypes(FALLBACK_NOTICE_TYPES);
    } finally {
      setMetaLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!isEdit) return () => {};

    (async () => {
      setNoticeLoading(true);
      try {
        const n = await fetchNoticeById(id);
        if (!mounted) return;
        setExistingAttachments(
          Array.isArray(n.attachments) ? n.attachments : []
        );
        setForm({
          targetAudience: n.targetAudience || "",
          title: n.title || "",
          employeeId: n?.recipientDetails?.employeeId || "",
          employeeName: n?.recipientDetails?.name || "",
          position: n?.recipientDetails?.position || "",
          noticeType: Array.isArray(n.noticeType)
            ? n.noticeType
            : n.noticeType
            ? [n.noticeType]
            : [],
          publishDate: dateToInputValue(n.publishDate),
          body: n.body || "",
        });
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load notice"
        );
        navigate("/notices");
      } finally {
        if (mounted) setNoticeLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isEdit, navigate]);

  const departmentOptions = useMemo(
    () => (departments || []).map((d) => ({ value: d, label: d })),
    [departments]
  );
  const noticeTypeOptions = useMemo(
    () => (noticeTypes || []).map((t) => ({ value: t, label: t })),
    [noticeTypes]
  );

  const employees = useMemo(
    () => [
      { employeeId: "EMP-1001", name: "Employee One", position: "Executive" },
      { employeeId: "EMP-1002", name: "Employee Two", position: "Officer" },
      { employeeId: "EMP-1003", name: "Employee Three", position: "Assistant" },
    ],
    []
  );

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ value: e.employeeId, label: e.employeeId })),
    [employees]
  );

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(status) {
    const next = {};

    if (!form.targetAudience)
      next.targetAudience = "Target Department(s) / Individual is required";
    if (!form.title) next.title = "Notice Title is required";
    if (!form.noticeType?.length)
      next.noticeType = "Select at least one Notice Type";
    if (!form.publishDate) next.publishDate = "Publish Date is required";
    if (!form.body) next.body = "Notice Body is required";

    if (isIndividual(form.targetAudience)) {
      if (!form.employeeId) next.employeeId = "Employee ID is required";
      if (!form.employeeName) next.employeeName = "Employee Name is required";
      if (!form.position) next.position = "Position is required";
    }

    return next;
  }

  async function submit(status) {
    const nextErrors = validate(status);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      let attachmentUrls = [];
      if (files.length) {
        const up = await uploadAttachments(files);
        attachmentUrls = (up.attachments || []).map((a) => a.url);
      }

      const payload = {
        title: form.title,
        targetAudience: form.targetAudience,
        noticeType: form.noticeType,
        publishDate: dateOnlyToLocalDate(form.publishDate),
        body: form.body,
        attachments: [...(existingAttachments || []), ...attachmentUrls],
        status,
        recipientDetails: isIndividual(form.targetAudience)
          ? {
              employeeId: form.employeeId,
              name: form.employeeName,
              position: form.position,
            }
          : undefined,
      };

      const saved = isEdit
        ? await updateNotice(id, payload)
        : await createNotice(payload);
      setCreatedNotice(saved);
      setSuccessOpen(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create notice";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const individual = isIndividual(form.targetAudience);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/notices"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Notice" : "Create a Notice"}
          </div>
          <div className="text-xs text-slate-500">
            Please fill in the details below
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        {noticeLoading ? (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Loading notice...
          </div>
        ) : null}
        {metaError ? (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="font-medium">
                Dropdown data couldn’t load from API
              </div>
              <div className="truncate text-xs text-amber-700">{metaError}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={loadMeta}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Target Department(s) or Individual"
            required
            value={form.targetAudience}
            onChange={(v) => {
              setField("targetAudience", v);
              if (String(v).toLowerCase() !== "individual") {
                setForm((prev) => ({
                  ...prev,
                  employeeId: "",
                  employeeName: "",
                  position: "",
                }));
              }
            }}
            placeholder={metaLoading ? "Loading..." : "Select"}
            options={departmentOptions}
            error={errors.targetAudience}
          />

          <Input
            label="Notice Title"
            required
            placeholder="Write the Title of Notice"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            error={errors.title}
          />

          {!individual ? (
            <div className="-mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Employee fields are only used when targeting{" "}
              <span className="font-medium">Individual</span>. Select
              <span className="font-medium"> Individual</span> above to enable
              them.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Select Employee ID"
              required={individual}
              value={form.employeeId}
              onChange={(v) => {
                setField("employeeId", v);
                const found = employees.find((e) => e.employeeId === v);
                if (found) {
                  setForm((prev) => ({
                    ...prev,
                    employeeId: found.employeeId,
                    employeeName: found.name,
                    position: found.position,
                  }));
                }
              }}
              placeholder="Select employee ID"
              options={employeeOptions}
              error={errors.employeeId}
              disabled={!individual}
              className={!individual ? "opacity-60 bg-slate-50" : ""}
            />
            <Input
              label="Employee Name"
              required={individual}
              placeholder="Enter employee full name"
              value={form.employeeName}
              onChange={(e) => setField("employeeName", e.target.value)}
              error={errors.employeeName}
              disabled={!individual}
              className={!individual ? "bg-slate-50" : ""}
            />
            <Input
              label="Position"
              required={individual}
              placeholder="Enter position"
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
              error={errors.position}
              disabled={!individual}
              className={!individual ? "bg-slate-50" : ""}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MultiSelectDropdown
              label="Notice Type"
              required
              options={noticeTypeOptions}
              value={form.noticeType}
              onChange={(v) => setField("noticeType", v)}
              placeholder="Select Notice Type"
              error={errors.noticeType}
            />
            <label className="block">
              <div className="mb-1 text-xs font-medium text-slate-700">
                Publish Date <span className="text-rose-500">*</span>
              </div>
              <input
                type="date"
                value={form.publishDate}
                onChange={(e) => setField("publishDate", e.target.value)}
                className={[
                  "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
                  errors.publishDate
                    ? "border-rose-300"
                    : "border-slate-200 focus:border-indigo-300",
                ].join(" ")}
              />
              {errors.publishDate ? (
                <div className="mt-1 text-xs text-rose-600">
                  {errors.publishDate}
                </div>
              ) : null}
            </label>
          </div>

          <label className="block">
            <div className="mb-1 text-xs font-medium text-slate-700">
              Notice Body <span className="text-rose-500">*</span>
            </div>
            <textarea
              rows={5}
              placeholder="Write the details about notice"
              value={form.body}
              onChange={(e) => setField("body", e.target.value)}
              className={[
                "w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
                errors.body
                  ? "border-rose-300"
                  : "border-slate-200 focus:border-indigo-300",
              ].join(" ")}
            />
            {errors.body ? (
              <div className="mt-1 text-xs text-rose-600">{errors.body}</div>
            ) : null}
          </label>

          <FileDropzone
            label="Upload Attachments (optional)"
            hint="Accepted File Type: jpg, png, webp, pdf"
            files={files}
            onFilesChange={setFiles}
            accept=".jpg,.jpeg,.png,.webp,.pdf"
          />

          {existingAttachments.length ? (
            <div className="-mt-1">
              <div className="text-xs font-medium text-slate-700">
                Existing Attachments
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {existingAttachments.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      setExistingAttachments((prev) =>
                        prev.filter((x) => x !== a)
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    title="Remove"
                  >
                    <span className="max-w-[220px] truncate">
                      {a.split("/").pop()}
                    </span>
                    <span className="text-slate-400">✕</span>
                  </button>
                ))}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Click a chip to remove it from the notice.
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => navigate("/notices")}
              disabled={submitting}
              className="sm:min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => submit("Draft")}
              disabled={submitting}
              className="sm:min-w-[140px]"
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => submit("Published")}
              disabled={submitting}
              className="sm:min-w-[150px]"
            >
              {submitting ? "Publishing..." : "Publish Notice"}
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        maxWidthClass="max-w-xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
              <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mt-4 text-xl font-semibold text-slate-900">
            {createdNotice?.status === "Draft"
              ? isEdit
                ? "Draft Updated Successfully"
                : "Draft Saved Successfully"
              : isEdit
              ? "Notice Updated Successfully"
              : "Notice Published Successfully"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Your notice{" "}
            <span className="font-medium">“{createdNotice?.title || "—"}”</span>{" "}
            has been created.
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                setSuccessOpen(false);
                navigate("/notices");
              }}
            >
              View Notice
            </Button>
            <Button
              variant="subtle"
              onClick={() => {
                setSuccessOpen(false);
                setCreatedNotice(null);
                setForm({
                  targetAudience: "",
                  title: "",
                  employeeId: "",
                  employeeName: "",
                  position: "",
                  noticeType: [],
                  publishDate: "",
                  body: "",
                });
                setFiles([]);
                setErrors({});
              }}
            >
              + Create Another
            </Button>
            <Button variant="secondary" onClick={() => setSuccessOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
