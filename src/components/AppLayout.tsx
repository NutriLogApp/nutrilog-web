import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  return (
    <div className="app-shell-outer min-h-screen" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
      <div className="app-shell-inner min-h-dvh" style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}>
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
}
