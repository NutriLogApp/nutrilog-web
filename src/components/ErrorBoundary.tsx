import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Can't use hooks in class components, so read language from document
function isHebrew() {
  return document.documentElement.dir === "rtl";
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const he = isHebrew();
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--bg-page)" }}>
          <div className="text-5xl mb-4">😿</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {he ? "משהו השתבש" : "Something went wrong"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {this.state.error?.message || (he ? "אירעה שגיאה לא צפויה" : "An unexpected error occurred")}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
            className="px-6 py-3 rounded-2xl text-white font-semibold"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {he ? "חזרה לדף הבית" : "Go Home"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
