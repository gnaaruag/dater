"use client";

import { useEffect } from "react";

export default function OfflineSupport() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let registration: ServiceWorkerRegistration | undefined;
    let disposed = false;
    const update = () => { void registration?.update().catch(() => {}); };
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((result) => {
        registration = result;
        if (!disposed) window.addEventListener("online", update);
      })
      .catch((error) => console.warn("Offline setup failed; retry on the next visit.", error));
    return () => {
      disposed = true;
      window.removeEventListener("online", update);
    };
  }, []);
  return null;
}
