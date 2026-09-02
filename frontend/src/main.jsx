import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const DEV_HOST = "test.inkconvention.com";

const currentHost = window.location.hostname;

const runningOnLocalhost =
  currentHost === "localhost" || currentHost === "127.0.0.1";

if (import.meta.env.DEV && runningOnLocalhost) {
  const url = new URL(window.location.href);

  url.hostname = DEV_HOST;
  url.port = "5173";

  console.log(`➡️ Redirecting MSG91 development host to ${url.origin}`);

  window.location.replace(url.toString());
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
