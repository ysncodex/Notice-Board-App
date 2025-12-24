import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout";
import { NoticeList } from "./pages/NoticeList";
import { CreateNotice } from "./pages/CreateNotice";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/notices" replace />} />
        <Route path="/notices" element={<NoticeList />} />
        <Route path="/notices/new" element={<CreateNotice />} />
        <Route path="/notices/:id/edit" element={<CreateNotice />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
