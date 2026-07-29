"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import styles from "./RegisterPage.module.css";
import { AuthAPI } from "@/lib/api/auth";
import { useTranslation } from "@/i18n/LocaleProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState(""); // ✅ required by backend
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errName, setErrName] = useState("");
  const [errPhone, setErrPhone] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPass, setErrPass] = useState("");
  const [errConfirm, setErrConfirm] = useState("");
  const [errAgree, setErrAgree] = useState("");
  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(false);

  function validate() {
    let ok = true;

    const n = fullName.trim();
    const p = phone.trim();
    const e = email.trim();

    if (!n) {
      setErrName(t("auth.validation.nameRequired"));
      ok = false;
    } else setErrName("");

    if (!p) {
      setErrPhone(t("auth.validation.phoneRequired"));
      ok = false;
    } else if (p.length < 7) {
      setErrPhone(t("auth.validation.phoneInvalid"));
      ok = false;
    } else setErrPhone("");

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

    if (!confirm) {
      setErrConfirm(t("auth.validation.confirmRequired"));
      ok = false;
    } else if (confirm !== pass) {
      setErrConfirm(t("auth.validation.confirmMismatch"));
      ok = false;
    } else setErrConfirm("");

    if (!agree) {
      setErrAgree(t("auth.validation.agreeRequired"));
      ok = false;
    } else setErrAgree("");

    return ok;
  }

  function onSubmit(e) {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    AuthAPI.register({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: pass,
    })
      .then(() => {
        // ✅ after register → go verify with email
        router.push(`/verify?email=${encodeURIComponent(email.trim())}`);
      })
      .catch((err) => {
        setApiError(err.message || t("auth.validation.genericRegisterFailed"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.overlay} />

      <div className={styles.wrapper}>
        {/* LEFT */}
        <section className={styles.left}>
          <h1>{t("auth.register.welcome")}</h1>
          <p>{t("auth.register.intro", { brand: t("common.brandName") })}</p>

          <div className={styles.perks}>
            {t("auth.register.perks").map((perk) => (
              <div className={styles.perk} key={perk}>
                <span className={styles.dot} />
                <p>{perk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CARD */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t("auth.register.heading")}</h2>
            <p>
              {t("auth.register.haveAccount")}{" "}
              <Link className={styles.link} href="/login">
                {t("auth.register.login")}
              </Link>
            </p>
          </div>

          <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
            {apiError ? <p className={styles.apiError}>{apiError}</p> : null}

            {/* Full Name */}
            <div className={styles.field}>
              <label>{t("auth.register.fullName")}</label>
              <input
                className={`${styles.input} ${errName ? styles.inputError : ""}`}
                type="text"
                placeholder={t("auth.register.fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrName("");
                }}
              />
              {errName ? <p className={styles.error}>{errName}</p> : null}
            </div>

            {/* Phone ✅ */}
            <div className={styles.field}>
              <label>{t("auth.register.phone")}</label>
              <input
                className={`${styles.input} ${errPhone ? styles.inputError : ""}`}
                type="tel"
                placeholder={t("auth.register.phonePlaceholder")}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrPhone("");
                }}
              />
              {errPhone ? <p className={styles.error}>{errPhone}</p> : null}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className={styles.field}>
              <label>{t("auth.common.password")}</label>
              <div className={styles.passWrap}>
                <input
                  className={`${styles.input} ${errPass ? styles.inputError : ""}`}
                  type={showPass ? "text" : "password"}
                  placeholder={t("auth.register.passwordPlaceholder")}
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

            {/* Confirm */}
            <div className={styles.field}>
              <label>{t("auth.register.confirmPassword")}</label>
              <div className={styles.passWrap}>
                <input
                  className={`${styles.input} ${errConfirm ? styles.inputError : ""}`}
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("auth.register.confirmPlaceholder")}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrConfirm("");
                  }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((p) => !p)}
                >
                  {showConfirm ? t("auth.common.hide") : t("auth.common.show")}
                </button>
              </div>
              {errConfirm ? <p className={styles.error}>{errConfirm}</p> : null}
            </div>

            {/* Agree */}
            <div className={styles.agreeRow}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setErrAgree("");
                  }}
                />
                <span>
                  {t("auth.register.agreePre")}{" "}
                  <Link className={styles.link} href="/terms">
                    {t("auth.register.terms")}
                  </Link>{" "}
                  {t("auth.register.and")}{" "}
                  <Link className={styles.link} href="/privacy">
                    {t("auth.register.privacy")}
                  </Link>
                </span>
              </label>
            </div>
            {errAgree ? <p className={styles.error}>{errAgree}</p> : null}

            <button className={styles.submit} disabled={loading} type="submit">
              {loading ? t("auth.register.submitting") : t("auth.register.submit")}
            </button>

            <p className={styles.secureText}>{t("auth.register.secured")}</p>
          </form>
        </section>
      </div>
    </main>
  );
}
