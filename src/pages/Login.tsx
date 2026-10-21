import { useState, type FormEvent } from "react";
import { cn } from "../utils/cn";
import { Icon, LogoMark } from "../components/Icons";
import { navigate, ROUTES } from "../lib/router";
import { auth, recovery, passwordProblem } from "../services/management";

type Mode = "signin" | "forgot" | "reset";

/**
 * Staff sign-in with self-service recovery.
 * ------------------------------------------------------------------
 *  • signin  — email + password
 *  • forgot  — request a one-time reset code (sent to the account email)
 *  • reset   — enter the code, set a new password, optionally a new email
 */
export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");

  // shared
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // signin
  const [password, setPassword] = useState("");

  // reset
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [issuedCode, setIssuedCode] = useState("");

  function resetFeedback() {
    setError("");
    setNotice("");
  }

  async function doSignIn(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    resetFeedback();
    setBusy(true);
    try {
      await auth.signIn(email.trim(), password);
      setPassword("");
      navigate(ROUTES.panel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function doForgot(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    resetFeedback();
    setBusy(true);
    try {
      const res = await recovery.requestCode(email.trim());
      // Open the account's mail client with the code (a genuine delivery),
      // and also surface it on-screen for this install.
      if (res.code) {
        setIssuedCode(res.code);
        const subject = encodeURIComponent("Your Pentecostal Penuel Church reset code");
        const body = encodeURIComponent(
          `Your one-time reset code is ${res.code}. It expires in 15 minutes.`
        );
        window.open(`mailto:${encodeURIComponent(email.trim())}?subject=${subject}&body=${body}`, "_blank");
      }
      setNotice(
        "If that email matches an account, a one-time reset code has been sent. Enter it below."
      );
      setMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start recovery.");
    } finally {
      setBusy(false);
    }
  }

  async function doReset(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    resetFeedback();
    const problem = passwordProblem(newPassword);
    if (problem) {
      setError(`The new password needs ${problem}.`);
      return;
    }
    setBusy(true);
    try {
      await recovery.reset({
        email: email.trim(),
        code: code.trim(),
        newPassword,
        newEmail: newEmail.trim() || undefined,
      });
      setNotice("Your password has been reset. You can now sign in.");
      setMode("signin");
      setPassword("");
      setNewPassword("");
      setCode("");
      if (newEmail.trim()) setEmail(newEmail.trim());
      setNewEmail("");
      setIssuedCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full border border-ink/20 bg-parchment-2 px-4 py-3 text-ink focus:border-gold-deep focus:outline-none";
  const labelCls = "mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.24em] text-stone";

  return (
    <section className="flex min-h-svh items-center bg-parchment py-10">
      <div className="mx-auto w-full max-w-md px-5 sm:px-8">
        {/* Navigation to return back to website */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-gold-deep transition-colors hover:text-ink"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Back to Website
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            className="text-[0.68rem] font-medium text-stone hover:text-ink"
          >
            Home
          </button>
        </div>

        <div className="border border-ink/15 bg-parchment-2/50 p-6 shadow-sm sm:p-8">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h1 className="mt-6 text-center font-display text-3xl font-bold text-ink">
            {mode === "signin" ? "Staff Sign In" : mode === "forgot" ? "Reset Access" : "Enter Reset Code"}
          </h1>
          <p className="mt-2 text-center text-sm text-stone">
            {mode === "signin"
              ? "Management portal for Pentecostal Penuel Church."
              : "We'll send a one-time code to your account email."}
          </p>

          {error && (
            <p role="alert" className="mt-6 flex items-start gap-2 border border-oxblood/40 bg-oxblood/5 px-4 py-3 text-sm text-oxblood">
              <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-6 flex items-start gap-2 border border-gold-deep/40 bg-gold/10 px-4 py-3 text-sm text-gold-deep">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" />
              {notice}
            </p>
          )}

          {/* ---- sign in ---- */}
          {mode === "signin" && (
            <form onSubmit={doSignIn} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className={labelCls}>Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(inputCls, "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone transition-colors hover:text-ink focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={busy} className="btn btn-gold w-full disabled:opacity-60">
                {busy ? "Signing in…" : "Sign In"} <Icon name="arrow" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { resetFeedback(); setMode("forgot"); }}
                className="w-full text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink"
              >
                Forgot password or email?
              </button>
            </form>
          )}

          {/* ---- forgot: request code ---- */}
          {mode === "forgot" && (
            <form onSubmit={doForgot} className="mt-8 space-y-5">
              <div>
                <label htmlFor="femail" className={labelCls}>Account email</label>
                <input
                  id="femail"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>
              <button type="submit" disabled={busy} className="btn btn-gold w-full disabled:opacity-60">
                {busy ? "Sending…" : "Send Reset Code"} <Icon name="arrow" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { resetFeedback(); setMode("signin"); }}
                className="w-full text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-stone hover:text-ink"
              >
                Back to sign in
              </button>
            </form>
          )}

          {/* ---- reset: code + new password ---- */}
          {mode === "reset" && (
            <form onSubmit={doReset} className="mt-8 space-y-5">
              {issuedCode && (
                <p className="border border-ink/15 bg-parchment-2 px-4 py-3 text-center text-sm text-stone">
                  Your reset code (also emailed):{" "}
                  <span className="font-mono text-base font-bold tracking-[0.3em] text-ink">{issuedCode}</span>
                </p>
              )}
              <div>
                <label htmlFor="code" className={labelCls}>Reset code</label>
                <input
                  id="code"
                  inputMode="numeric"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={inputCls}
                  placeholder="6-digit code"
                />
              </div>
              <div>
                <label htmlFor="np" className={labelCls}>New password</label>
                <div className="relative">
                  <input
                    id="np"
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={cn(inputCls, "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone transition-colors hover:text-ink focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                    title={showNewPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showNewPassword ? "eyeOff" : "eye"} className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="ne" className={labelCls}>New email (optional)</label>
                <input
                  id="ne"
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputCls}
                  placeholder="Leave blank to keep your current email"
                />
              </div>
              <button type="submit" disabled={busy} className="btn btn-gold w-full disabled:opacity-60">
                {busy ? "Saving…" : "Reset Password"} <Icon name="arrow" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { resetFeedback(); setMode("signin"); }}
                className="w-full text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-stone hover:text-ink"
              >
                Back to sign in
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-ink/10 pt-5 text-center">
            <button
              type="button"
              onClick={() => navigate(ROUTES.home)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone hover:text-ink"
            >
              <Icon name="home" className="h-3.5 w-3.5" />
              Return to Pentecostal Penuel Church Website
            </button>
            <p className="mt-4 text-[0.68rem] leading-relaxed text-stone/70">
              Restricted area. All sign-in and management activity is recorded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
