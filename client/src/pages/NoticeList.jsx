import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Pagination,
  Select,
  StatusPill,
  ToggleSwitch,
} from "../components/ui";
import {
  FALLBACK_DEPARTMENTS_OR_INDIVIDUAL,
  fetchMeta,
  fetchNotices,
  updateNoticeStatus,
} from "../api";

function formatDateShort(d) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

function joinNoticeType(nt) {
  if (!nt) return "—";
  if (Array.isArray(nt)) return nt.join(", ");
  return String(nt);
}

export function NoticeList() {
  const navigate = useNavigate();

  const [meta, setMeta] = useState({
    departmentsOrIndividual: [],
    noticeTypes: [],
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [filters, setFilters] = useState({
    dept: "",
    q: "",
    status: "",
    publishedOn: "",
  });

  const [page, setPage] = useState(1);
  const limit = 5;

  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ published: 0, draft: 0 });

  const [viewing, setViewing] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    function onDown(e) {
      if (e.target?.closest?.('[data-menu-root="notice-actions"]')) return;
      setMenuOpenId(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function refreshCounts() {
    try {
      const [pub, dr] = await Promise.all([
        fetchNotices({ page: 1, limit: 1, status: "Published" }),
        fetchNotices({ page: 1, limit: 1, status: "Draft" }),
      ]);
      setCounts({ published: pub.total || 0, draft: dr.total || 0 });
    } catch {
    }
  }

  async function loadMeta() {
    setMetaLoading(true);
    setMetaError("");
    try {
      const m = await fetchMeta();
      setMeta({
        departmentsOrIndividual:
          m.departmentsOrIndividual || FALLBACK_DEPARTMENTS_OR_INDIVIDUAL,
        noticeTypes: m.noticeTypes || [],
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load dropdown data from API. Using fallback values.";
      setMetaError(msg);
      setMeta({
        departmentsOrIndividual: FALLBACK_DEPARTMENTS_OR_INDIVIDUAL,
        noticeTypes: [],
      });
    } finally {
      setMetaLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const statusParam = filters.status || undefined;
        const res = await fetchNotices({ page, limit, status: statusParam });
        if (!mounted) return;
        setData(res);
      } catch (err) {
        alert(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch notices"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [filters.status, page]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pub, dr] = await Promise.all([
          fetchNotices({ page: 1, limit: 1, status: "Published" }),
          fetchNotices({ page: 1, limit: 1, status: "Draft" }),
        ]);
        if (!mounted) return;
        setCounts({ published: pub.total || 0, draft: dr.total || 0 });
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const deptOptions = useMemo(
    () =>
      (meta.departmentsOrIndividual || []).map((d) => ({ value: d, label: d })),
    [meta.departmentsOrIndividual]
  );

  const statusOptions = useMemo(
    () => [
      { value: "Published", label: "Published" },
      { value: "Unpublished", label: "Unpublished" },
      { value: "Draft", label: "Draft" },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    const q = String(filters.q || "")
      .trim()
      .toLowerCase();
    const dept = filters.dept;
    const date = filters.publishedOn;

    return (data.items || []).filter((n) => {
      if (dept && n.targetAudience !== dept) return false;
      if (q) {
        const hay = [
          n.title,
          n.targetAudience,
          n?.recipientDetails?.employeeId,
          n?.recipientDetails?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (date) {
        const d = new Date(n.publishDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const local = `${yyyy}-${mm}-${dd}`;
        if (local !== date) return false;
      }
      return true;
    });
  }, [data.items, filters.dept, filters.publishedOn, filters.q]);

  function applyCountDelta(prevStatus, nextStatus) {
    setCounts((prev) => {
      let published = prev.published ?? 0;
      let draft = prev.draft ?? 0;

      if (prevStatus === nextStatus) return prev;
      if (prevStatus === "Published") published -= 1;
      if (prevStatus === "Draft") draft -= 1;
      if (nextStatus === "Published") published += 1;
      if (nextStatus === "Draft") draft += 1;

      return { published: Math.max(0, published), draft: Math.max(0, draft) };
    });
  }

  async function setStatus(n, status) {
    try {
      const prevStatus = n.status;
      const updated = await updateNoticeStatus(n._id, status);
      applyCountDelta(prevStatus, updated.status);

      setData((prev) => {
        const nextItems = (prev.items || []).map((x) =>
          x._id === n._id ? updated : x
        );
        if (filters.status && updated.status !== filters.status) {
          return { ...prev, items: nextItems.filter((x) => x._id !== n._id) };
        }
        return { ...prev, items: nextItems };
      });

      setMenuOpenId(null);
      refreshCounts();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update status"
      );
    }
  }

  function toggleRow(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setFilters({ dept: "", q: "", status: "", publishedOn: "" });
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[18px] font-semibold leading-6 text-slate-900">
            Notice Management
          </div>
          <div className="mt-1 text-xs text-slate-600">
            <span className="text-emerald-700">
              Active Notices: {counts.published}
            </span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-orange-700">
              Draft Notice: {counts.draft}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="primary" onClick={() => navigate("/notices/new")}>
            + Create Notice
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters((p) => ({ ...p, status: "Draft" }));
              setPage(1);
            }}
          >
            All Draft Notice
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 sm:pr-[30px]">
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

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <Select
            label="Filter by"
            value={filters.dept}
            onChange={(v) => setFilters((p) => ({ ...p, dept: v }))}
            placeholder={
              metaLoading ? "Loading..." : "Departments or individuals"
            }
            options={deptOptions}
            className="py-1.5 text-xs"
          />
          <label className="block">
            <div className="mb-1 text-[11px] font-medium text-slate-700">
              Employee Id or Name
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-300"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              placeholder="Search..."
            />
          </label>
          <Select
            label="Status"
            value={filters.status}
            onChange={(v) => {
              setFilters((p) => ({ ...p, status: v }));
              setPage(1);
            }}
            placeholder="All"
            options={statusOptions}
            className="py-1.5 text-xs"
          />
          <label className="block">
            <div className="mb-1 text-[11px] font-medium text-slate-700">
              Published on
            </div>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-300"
              value={filters.publishedOn}
              onChange={(e) =>
                setFilters((p) => ({ ...p, publishedOn: e.target.value }))
              }
            />
          </label>
          <div className="flex items-end justify-start gap-2 lg:justify-end">
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="w-12 px-4 py-3">
                  <SelectAllCheckbox
                    items={filteredItems}
                    selectedIds={selectedIds}
                    onChange={setSelectedIds}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Notice Type</th>
                <th className="px-4 py-3">Departments/Individual</th>
                <th className="px-4 py-3">Published On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    Loading notices...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={7}>
                    No notices found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((n) => (
                  <tr key={n._id} className="hover:bg-slate-50/50">
                    <td className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300"
                        aria-label="Select row"
                        checked={selectedIds.has(n._id)}
                        onChange={() => toggleRow(n._id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[360px] truncate font-medium text-slate-900">
                        {n.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[260px] truncate text-slate-600">
                        {joinNoticeType(n.noticeType)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-indigo-700">
                        {n.targetAudience}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateShort(n.publishDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={n.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        data-menu-root="notice-actions"
                      >
                        <button
                          type="button"
                          onClick={() => setViewing(n)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="View"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                          >
                            <path
                              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/notices/${n._id}/edit`)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="Edit"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                          >
                            <path
                              d="M12 20h9"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuOpenId((prev) =>
                                prev === n._id ? null : n._id
                              )
                            }
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            aria-label="More"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5"
                              fill="none"
                            >
                              <path
                                d="M12 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {menuOpenId === n._id ? (
                            <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                              <StatusToggleRow
                                label="Published"
                                checked={n.status === "Published"}
                                onChange={(checked) =>
                                  checked
                                    ? setStatus(n, "Published")
                                    : setStatus(n, "Unpublished")
                                }
                              />
                              <StatusToggleRow
                                label="Unpublished"
                                checked={n.status === "Unpublished"}
                                onChange={(checked) =>
                                  checked
                                    ? setStatus(n, "Unpublished")
                                    : setStatus(n, "Published")
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 p-4">
          <Pagination
            page={page}
            totalPages={data.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title="Notice Details"
        maxWidthClass="max-w-2xl"
      >
        {viewing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-slate-500">Title</div>
                <div className="text-sm font-semibold text-slate-900">
                  {viewing.title}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Status</div>
                <div className="mt-1">
                  <StatusPill status={viewing.status} />
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Target</div>
                <div className="text-sm text-slate-800">
                  {viewing.targetAudience}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Publish Date
                </div>
                <div className="text-sm text-slate-800">
                  {formatDateShort(viewing.publishDate)}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-slate-500">
                  Notice Type
                </div>
                <div className="text-sm text-slate-800">
                  {joinNoticeType(viewing.noticeType)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500">Body</div>
              <div className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {viewing.body || "—"}
              </div>
            </div>

            {Array.isArray(viewing.attachments) &&
            viewing.attachments.length ? (
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Attachments
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewing.attachments.map((a) => (
                    <a
                      key={a}
                      href={
                        (import.meta.env.VITE_API_URL ||
                          "http://localhost:5000") + a
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {a.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
              <Button variant="indigo" onClick={() => navigate("/notices/new")}>
                + Create Another
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function StatusToggleRow({ label, checked, onChange }) {
  const activeLabelClass =
    label === "Published" && checked ? "text-emerald-700" : "text-slate-700";

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2 text-xs">
      <span className={["font-medium", activeLabelClass].join(" ")}>
        {label}
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function SelectAllCheckbox({ items, selectedIds, onChange }) {
  const ids = (items || []).map((x) => x._id);
  const total = ids.length;
  const selectedCount = ids.reduce(
    (acc, id) => acc + (selectedIds.has(id) ? 1 : 0),
    0
  );
  const all = total > 0 && selectedCount === total;
  const none = selectedCount === 0;

  return (
    <input
      ref={(el) => {
        if (el) el.indeterminate = !all && !none;
      }}
      type="checkbox"
      className="h-4 w-4 rounded border-slate-300"
      aria-label="Select all rows on this page"
      checked={all}
      onChange={() => {
        if (all) {
          const next = new Set(selectedIds);
          ids.forEach((id) => next.delete(id));
          onChange(next);
        } else {
          const next = new Set(selectedIds);
          ids.forEach((id) => next.add(id));
          onChange(next);
        }
      }}
    />
  );
}
