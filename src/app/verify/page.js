"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import styles from "./VerifyPage.module.css";
import { AuthAPI } from "@/lib/api/auth";
import { saveToken } from "@/lib/auth/storage";
import Toast from "@/components/ui/Toast";
import { useTranslation } from "@/i18n/LocaleProvider";

// useSearchParams() requires a Suspense boundary at build time
// (https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout).
export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const email = params.get("email") || "";

  const inputsRef = useRef([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState("");

  const codeValue = useMemo(() => code.join(""), [code]);
  const isComplete = code.every((d) => d !== "");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function setDigit(index, val) {
    setCode((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  }

  function handlePasteText(text) {
    const digits = String(text).replace(/\D/g, "").slice(0, 6);
    if (!digits.length) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];

    setCode(next);

    const lastIndex = Math.min(digits.length - 1, 5);
    inputsRef.current[lastIndex]?.focus();
  }

  function onPaste(e) {
    e.preventDefault();
    handlePasteText(e.clipboardData.getData("text"));
  }

  function handleChange(index, e) {
    const raw = e.target.value;
    const digit = raw.replace(/\D/g, "");

    // mobile sometimes inserts multiple digits
    if (digit.length > 1) {
      handlePasteText(digit);
      return;
    }

    setDigit(index, digit);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (code[index]) {
        setDigit(index, "");
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    }

    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function onSubmit(e) {
    e.preventDefault();
    setApiError("");

    if (!email) {
      setApiError(t("auth.verify.missingEmail"));
      return;
    }

    if (!isComplete) {
      setApiError(t("auth.verify.incomplete"));
      return;
    }

    setLoading(true);

    AuthAPI.verify({ email, code: codeValue })
      .then((data) => {
        // ✅ your response: data.data.token + data.data.name
        const token = data?.data?.token;
        const name = data?.data?.name;

        if (!token) throw new Error(t("auth.validation.tokenMissing"));

        // ✅ store token immediately. Cannot throw — the auth storage boundary
        // absorbs a blocked or full store, so a browser that refuses
        // persistence is never reported as a failed verification.
        saveToken(token, { remember: true });

        // ✅ show toast here (not in home)
        setToast(
          name ? t("auth.verify.welcomeNamed", { name }) : t("auth.verify.welcome")
        );

        // ✅ wait 2.5s then redirect (AOS will animate home)
        setTimeout(() => {
          router.push("/");
        }, 2500);
      })
      .catch((err) => {
        setApiError(err.message || t("auth.validation.genericVerifyFailed"));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main id="main-content" className={styles.page}>
      <Toast message={toast} onClose={() => setToast("")} />

      <div className={styles.overlay} />

      <section className={styles.card}>
        <h1 className={styles.title}>{t("auth.verify.title")}</h1>

        <p className={styles.subtitle}>
          {t("auth.verify.subtitle")}{" "}
          <span className={styles.email}>{email || t("auth.verify.yourEmail")}</span>
        </p>

        <Link href="/register" className={styles.changeEmail}>
          {t("auth.verify.changeEmail")}
        </Link>

        <form onSubmit={onSubmit} className={styles.form} autoComplete="off">
          {apiError ? <p className={styles.apiError}>{apiError}</p> : null}

          {/* Numeric OTP always reads left-to-right, even in RTL. */}
          <div className={styles.codeRow} onPaste={onPaste} dir="ltr">
            {code.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                className={styles.codeInput}
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={t("auth.verify.digitLabel", { n: i + 1 })}
              />
            ))}
          </div>

          <button
            type="submit"
            className={styles.verifyBtn}
            disabled={!isComplete || loading}
          >
            {loading ? t("auth.verify.submitting") : t("auth.verify.submit")}
          </button>

          <p className={styles.secure}>{t("auth.verify.secured")}</p>
        </form>
      </section>
    </main>
  );
}
