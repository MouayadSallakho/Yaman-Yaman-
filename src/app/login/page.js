"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./LoginPage.module.css";
import { AuthAPI } from "@/lib/api/auth";
import { AuthStorage } from "@/lib/auth/storage";
import Toast from "@/components/ui/Toast";
import { useTranslation } from "@/i18n/LocaleProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const [errEmail, setErrEmail] = useState("");
  const [errPass, setErrPass] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState("");

  function validate() {
    let ok = true;

    const e = email.trim();
    if (!e) {
      setErrEmail(t("auth.validation.emailRequired"));
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(e)) {
      setErrEmail(t("auth.validation.emailInvalid"));
      ok = false;
    } else setErrEmail("");

    if (!pass) {
      setErrPass(t("auth.validation.passwordRequired"));
      ok = false;
    } else if (pass.length < 6) {
      setErrPass(t("auth.validation.passwordMin"));
      ok = false;
    } else setErrPass("");

    return ok;
  }

  function onSubmit(e) {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    AuthAPI.login({ email: email.trim(), password: pass })
      .then((data) => {
        const token = data?.token;
        if (!token) throw new Error(t("auth.validation.tokenMissing"));

        // store token immediately
        if (remember) AuthStorage.setToken(token);
        else sessionStorage.setItem("token", token);

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

          <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
            {apiError ? <p className={styles.apiError}>{apiError}</p> : null}

            <div className={styles.field}>
              <label>{t("auth.common.email")}</label>
              <input
                className={`${styles.input} ${errEmail ? styles.inputError : ""}`}
                type="email"
                placeholder={t("auth.common.emailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrEmail("");
                }}
              />
              {errEmail ? <p className={styles.error}>{errEmail}</p> : null}
            </div>

            <div className={styles.field}>
              <label>{t("auth.common.password")}</label>
              <div className={styles.passWrap}>
                <input
                  className={`${styles.input} ${errPass ? styles.inputError : ""}`}
                  type={showPass ? "text" : "password"}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setErrPass("");
                  }}
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
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>{t("auth.login.rememberMe")}</span>
              </label>

              <Link className={styles.link} href="/forgot-password">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <button className={styles.submit} disabled={loading} type="submit">
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
