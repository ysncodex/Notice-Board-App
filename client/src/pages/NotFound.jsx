import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <div className="text-2xl font-semibold text-slate-900">
          Page not found
        </div>
        <div className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist.
        </div>
        <Link
          to="/notices"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Notice Board
        </Link>
      </div>
    </div>
  );
}
