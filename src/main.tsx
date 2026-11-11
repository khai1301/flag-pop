import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "@fontsource/be-vietnam-pro/latin-800.css";
import "@fontsource/be-vietnam-pro/vietnamese-800.css";
import "./styles.css";
import "./enhancements.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="empty-state">
        <h1>Chuyến đi tạm gián đoạn</h1>
        <p>
          Thử tải lại trang để tiếp tục. Nếu lỗi lặp lại, bạn có thể bỏ lượt
          đang chơi.
        </p>
        <button className="primary" onClick={() => location.reload()}>
          Tải lại
        </button>
        <button
          className="secondary"
          onClick={() => {
            try {
              localStorage.removeItem("flagpop-session-v1");
              sessionStorage.removeItem("flagpop-session-v1");
            } catch {}
            location.reload();
          }}
        >
          Bỏ lượt đang chơi
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        await navigator.serviceWorker.ready;
        if (registration.active)
          window.dispatchEvent(new Event("flagpop-offline-ready"));
      })
      .catch(() => {
        /* Online play still works without offline cache. */
      });
  });
}
