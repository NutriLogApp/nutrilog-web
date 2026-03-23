import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Outlet />
      <NavBar />
    </div>
  );
}
