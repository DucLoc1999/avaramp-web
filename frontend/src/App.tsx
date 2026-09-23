/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { SiteLayout } from './components/layout/SiteLayout';
import Index from './pages/Index';
import LoginPage from "./pages/Login";
import RampPage from "./pages/Ramp";
import TermsOfServicePage from "./pages/TermsOfService";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import NotFoundPage from "./pages/NotFound";
import { clearSession, createSession, isSessionValid } from "./utils/session";

const navigateTo = (path: string, replace = false): void => {
  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onRouteChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, []);

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [path]);

  useEffect(() => {
    if (path === "/ramp" && !isSessionValid()) {
      clearSession();
      navigateTo(`/login?next=%2Framp`, true);
    }
  }, [path]);

  const handleGoogleLogin = async (idToken: string): Promise<void> => {
    const baseUrl = import.meta.env.VITE_BASE_URL as string;
    const res = await fetch(`${baseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken, client: "web" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(body.error?.message ?? "Authentication failed. Please try again.");
    }
    const body = await res.json() as {
      data: { access_token: string; expires_in: number; user: { id: number; email: string; name: string; kyc_status: string } };
    };
    createSession({
      token: body.data.access_token,
      createdAt: Date.now(),
      expiresAt: Date.now() + body.data.expires_in * 1000,
      mode: "google",
      user: body.data.user,
    });
    const next = new URLSearchParams(window.location.search).get("next");
    navigateTo(next || "/ramp", true);
  };

  if (path === "/login") {
    if (isSessionValid()) {
      const next = new URLSearchParams(window.location.search).get("next");
      navigateTo(next || "/ramp", true);
      return null;
    }
    return (
      <LoginPage onGoogleLogin={handleGoogleLogin} />
    );
  }

  if (path === "/ramp") {
    return (
      <RampPage
        onLogout={() => {
          clearSession();
          navigateTo("/login?next=%2Framp", true);
        }}
      />
    );
  }

  if (path === "/terms") {
    return <TermsOfServicePage />;
  }

  if (path === "/privacy") {
    return <PrivacyPolicyPage />;
  }

  if (path === "/") {
    return (
      <SiteLayout>
        <Index />
      </SiteLayout>
    );
  }

  return <NotFoundPage />;
}
