import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RampFooter } from "../components/layout/RampFooter";
import { RampHeader } from "../components/layout/RampHeader";

interface LoginPageProps {
  onGoogleLogin: (idToken: string) => Promise<void>;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            },
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function LoginPage({ onGoogleLogin }: LoginPageProps) {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const onGoogleLoginRef = useRef(onGoogleLogin);
  onGoogleLoginRef.current = onGoogleLogin;
  const initializedRef = useRef(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
      | string
      | undefined;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current) return;
      if (initializedRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setGoogleError(null);
          setGoogleLoading(true);
          try {
            await onGoogleLoginRef.current(response.credential);
          } catch (err) {
            setGoogleError(
              err instanceof Error ? err.message : "Google sign-in failed.",
            );
          } finally {
            setGoogleLoading(false);
          }
        },
        use_fedcm_for_prompt: false,
      });

      initializedRef.current = true;

      window.google.accounts.id.cancel();

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: googleBtnRef.current.offsetWidth || 400,
        text: "signin_with",
        shape: "rectangular",
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.getElementById(
        "google-gsi",
      ) as HTMLScriptElement | null;
      if (script) {
        script.addEventListener("load", initGoogle, { once: true });
      }
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <RampHeader />

      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Sign in to AvaRamp
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Use your Google account to access the trading menu.
            </p>

            <div className="mt-6 space-y-3">
              {clientId ? (
                <>
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      minHeight: 44,
                    }}
                  >
                    <div ref={googleBtnRef} className="w-full" />
                  </div>
                  {googleLoading && (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                      Signing in…
                    </p>
                  )}
                  {googleError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                      {googleError}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <strong>VITE_GOOGLE_CLIENT_ID</strong> is not set. Google
                  Sign-In is unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RampFooter />
    </div>
  );
}
