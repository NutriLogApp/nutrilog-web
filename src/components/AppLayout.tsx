import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
      <Outlet />
      <NavBar />
    </div>
  );
}
