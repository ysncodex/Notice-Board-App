import { useEffect, useMemo, useRef, useState } from "react";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
  };

  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-700",
  };

  return (
    <button
      type={type}
      className={[base, sizes[size], variants[variant], className].join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, required, error, className = "", ...props }) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-700">
          {label} {required ? <span className="text-rose-500">*</span> : null}
        </div>
      ) : null}
      <input
        className={[
          "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-indigo-300",
          className,
        ].join(" ")}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  );
}

export function Select({
  label,
  required,
  error,
  options,
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-700">
          {label} {required ? <span className="text-rose-500">*</span> : null}
        </div>
      ) : null}
      <select
        className={[
          "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-indigo-300",
          className,
        ].join(" ")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </label>
  );
}

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function onDown(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [handler, ref]);
}

export function MultiSelectDropdown({
  label,
  required,
  error,
  options,
  value,
  onChange,
  placeholder = "Select",
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useOnClickOutside(boxRef, () => setOpen(false));

  const selected = useMemo(() => new Set(value || []), [value]);

  function toggleOption(opt) {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(Array.from(next));
  }

  const summary =
    (value || []).length === 0
      ? placeholder
      : (value || []).length === 1
      ? value[0]
      : `${value.length} selected`;

  return (
    <div className="relative" ref={boxRef}>
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-700">
          {label} {required ? <span className="text-rose-500">*</span> : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
          error ? "border-rose-300" : "border-slate-200 hover:border-slate-300",
        ].join(" ")}
      >
        <span
          className={(value || []).length ? "text-slate-900" : "text-slate-400"}
        >
          {summary}
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none">
          <path
            d="M7 10l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="max-h-56 overflow-auto pr-1">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                  className="h-4 w-4"
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <div className="mt-1 text-xs text-rose-600">{error}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative mx-auto flex min-h-full items-center justify-center p-4">
        <div
          className={[
            "w-full rounded-2xl bg-white p-6 shadow-xl",
            maxWidthClass,
          ].join(" ")}
        >
          {title ? (
            <div className="text-lg font-semibold text-slate-900">{title}</div>
          ) : null}
          <div className={title ? "mt-4" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FileDropzone({ label, hint, files, onFilesChange, accept }) {
  const inputRef = useRef(null);

  function addFiles(fileList) {
    const arr = Array.from(fileList || []);
    if (!arr.length) return;
    const next = [...(files || []), ...arr];
    onFilesChange(next);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  }

  function removeAt(idx) {
    const next = [...(files || [])];
    next.splice(idx, 1);
    onFilesChange(next);
  }

  return (
    <div>
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-700">{label}</div>
      ) : null}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/30 p-6 text-center"
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M12 16V8m0 0 3 3m-3-3-3 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 16.5A4.5 4.5 0 0 0 18 8.2 6 6 0 1 0 4 11.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 text-sm font-medium text-emerald-700 hover:underline"
        >
          Upload
        </button>
        <div className="text-xs text-slate-500">
          {hint || "Click to upload or drag and drop."}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {(files || []).length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((f, idx) => (
            <div
              key={`${f.name}-${idx}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
            >
              <span className="max-w-[220px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Remove file"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                  <path
                    d="M7 7l10 10M17 7 7 17"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const cfg =
    s === "published"
      ? {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          label: "Published",
        }
      : s === "unpublished"
      ? {
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-200",
          label: "Unpublished",
        }
      : {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
          label: "Draft",
        };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        cfg.bg,
        cfg.text,
        cfg.border,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}

export function ToggleSwitch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      aria-label={label || "Toggle"}
      onClick={() => !disabled && onChange?.(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
        checked
          ? "bg-emerald-500 border-emerald-500"
          : "bg-slate-200 border-slate-200",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

export function Pagination({ page, totalPages, onPageChange, className = "" }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div
      className={["flex items-center justify-center gap-2", className].join(
        " "
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        aria-label="Previous page"
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
      </button>

      <div className="flex items-center gap-1">
        {start > 1 ? (
          <span className="px-2 text-sm text-slate-500">…</span>
        ) : null}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              "h-9 w-9 rounded-xl text-sm",
              p === page
                ? "border border-indigo-100 bg-indigo-50 text-indigo-700"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        {end < totalPages ? (
          <span className="px-2 text-sm text-slate-500">…</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        aria-label="Next page"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
