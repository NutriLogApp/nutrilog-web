import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
      <Outlet />
      <NavBar />
    </div>
  );
}
