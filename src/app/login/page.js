"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./LoginPage.module.css";
import { AuthAPI } from "@/lib/api/auth";
import { saveToken } from "@/lib/auth/storage";
import Toast from "@/components/ui/Toast";
import useHydrated from "@/hooks/useHydrated";
import { useTranslation } from "@/i18n/LocaleProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [showPass, setShowPass] = useState(false);
  const hydrated = useHydrated();

  /*
    The credential fields are deliberately uncontrolled.

    The browser can fill them before React exists, and that is worth keeping:
    someone types their address while the bundle is still on the wire, and a
    password manager fills both the moment the form is parsed. Neither reaches
    React. Backing them with `value={state}` therefore guarantees a divergence,
    and React resolves that divergence its own way — measured here, it blanked a
    field the user had already filled and then rejected the submit with "Email
    is required" over text they could plainly read.

    Reconciling the two halves after the fact loses a race that cannot be won:
    React writes the empty value during the commit, which happens before any
    effect that could have read the real one. Not creating the divergence is the
    only version of this that has no timing in it at all. The DOM is the single
    source of truth for these three fields, `onChange` is kept purely to clear a
    stale validation message, and nothing in this component ever writes over what
    the browser put in.
  */
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const rememberRef = useRef(null);

  /** What the form actually contains right now — read at validation and submit. */
  const readForm = () => ({
    email: (emailRef.current?.value ?? "").trim(),
    password: passRef.current?.value ?? "",
    remember: rememberRef.current?.checked ?? true,
  });

  const [errEmail, setErrEmail] = useState("");
  const [errPass, setErrPass] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState("");

  function validate(values) {
    let ok = true;

    const e = values.email;
    if (!e) {
      setErrEmail(t("auth.validation.emailRequired"));
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(e)) {
      setErrEmail(t("auth.validation.emailInvalid"));
      ok = false;
    } else setErrEmail("");

    if (!values.password) {
      setErrPass(t("auth.validation.passwordRequired"));
      ok = false;
    } else if (values.password.length < 6) {
      setErrPass(t("auth.validation.passwordMin"));
      ok = false;
    } else setErrPass("");

    return ok;
  }

  function onSubmit(e) {
    e.preventDefault();
    setApiError("");

    const values = readForm();

    if (!validate(values)) return;

    setLoading(true);

    AuthAPI.login({ email: values.email, password: values.password })
      .then((data) => {
        const token = data?.token;
        if (!token) throw new Error(t("auth.validation.tokenMissing"));

        // Store the token immediately. This cannot throw: the auth storage
        // boundary absorbs a blocked or full store and keeps the session in
        // memory, so a browser that refuses persistence never surfaces here as
        // a failed sign-in.
        saveToken(token, { remember: values.remember });

        // show toast here
        setToast(t("auth.login.toast"));

        // delay redirect 2.5s
        setTimeout(() => {
          router.push("/");
        }, 2500);
      })
      .catch((err) => {
        setApiError(err.message || t("auth.validation.genericLoginFailed"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main id="main-content" className={styles.page}>
      <Toast message={toast} onClose={() => setToast("")} />

      <div className={styles.overlay} />

      <div className={styles.wrapper}>
        <section className={styles.left}>
          <h1>{t("auth.login.welcome")}</h1>
          <p>{t("auth.login.intro", { brand: t("common.brandName") })}</p>

          <div className={styles.perks}>
            {t("auth.login.perks").map((perk) => (
              <div className={styles.perk} key={perk}>
                <span className={styles.dot} />
                <p>{perk}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t("auth.login.heading")}</h2>
            <p>
              {t("auth.login.newMember")}{" "}
              <Link className={styles.link} href="/register">
                {t("auth.login.registerNow")}
              </Link>
            </p>
          </div>

          {/* No `autoComplete="off"`: this is a sign-in form, and switching
              autofill off here is what stops a password manager from filling
              it at all. No `name` attributes either — the form has no action
              and its default button is disabled until submission is handled in
              JavaScript, so there is no native GET that could carry an address
              or a password in a URL. */}
          <form className={styles.form} onSubmit={onSubmit}>
            {apiError ? <p className={styles.apiError}>{apiError}</p> : null}

            <div className={styles.field}>
              <label>{t("auth.common.email")}</label>
              <input
                ref={emailRef}
                className={`${styles.input} ${errEmail ? styles.inputError : ""}`}
                type="email"
                autoComplete="email"
                placeholder={t("auth.common.emailPlaceholder")}
                defaultValue=""
                onChange={() => setErrEmail("")}
              />
              {errEmail ? <p className={styles.error}>{errEmail}</p> : null}
            </div>

            <div className={styles.field}>
              <label>{t("auth.common.password")}</label>
              <div className={styles.passWrap}>
                <input
                  ref={passRef}
                  className={`${styles.input} ${errPass ? styles.inputError : ""}`}
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  defaultValue=""
                  onChange={() => setErrPass("")}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? t("auth.common.hide") : t("auth.common.show")}
                </button>
              </div>
              {errPass ? <p className={styles.error}>{errPass}</p> : null}
            </div>

            <div className={styles.row}>
              <label className={styles.check}>
                <input
                  ref={rememberRef}
                  type="checkbox"
                  defaultChecked
                />
                <span>{t("auth.login.rememberMe")}</span>
              </label>

              <Link className={styles.link} href="/forgot-password">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            {/*
              Also disabled until this form is live. Signing in is entirely a
              client concern here — there is no server action behind it — so a
              submit before hydration does not sign anyone in: the browser
              performs its default GET, the page reloads, and whatever was typed
              is gone. Disabling the default button also suppresses Enter-to-
              submit, which is the same trap by a different key.
            */}
            <button className={styles.submit} disabled={loading || !hydrated} type="submit">
              {loading ? t("auth.login.submitting") : t("auth.login.submit")}
            </button>

            <div className={styles.divider}>
              <span>{t("auth.common.or")}</span>
            </div>

            <button type="button" className={styles.socialBtn}>
              {t("auth.common.continueGoogle")}
            </button>

            <button type="button" className={`${styles.socialBtn} ${styles.socialDark}`}>
              {t("auth.common.continueApple")}
            </button>

            <p className={styles.secureText}>{t("auth.common.secured")}</p>
          </form>
        </section>
      </div>
    </main>
  );
}
