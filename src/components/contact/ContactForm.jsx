"use client";

import { useId, useRef, useState } from "react";
import { FiAlertCircle, FiInfo, FiSend } from "react-icons/fi";

import Toast from "@/components/ui/Toast";
import useHydrated from "@/hooks/useHydrated";
import { useTranslation } from "@/i18n/LocaleProvider";
import { ContactAPI, ContactChannelUnavailableError } from "@/lib/api/contact";
import styles from "./ContactPage.module.css";

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 2000;

const SUBJECTS = ["order", "product", "returns", "business", "other"];

export default function ContactForm() {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const uid = useId();

  /*
    Same contract as the sign-in form: every field is uncontrolled and the DOM
    is the single source of truth.

    The browser can fill a name and an email before this bundle arrives, and a
    visitor can start typing into markup the server already painted. Backing any
    of it with `value={state}` guarantees React commits an empty string over
    what is already there, and that commit happens before any effect could read
    the real value back. Nothing in this component ever writes into these nodes;
    `onChange` only clears a stale error, and the counter below only *reads*.
  */
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  const readForm = () => ({
    name: (nameRef.current?.value ?? "").trim(),
    email: (emailRef.current?.value ?? "").trim(),
    subject: subjectRef.current?.value ?? "",
    message: (messageRef.current?.value ?? "").trim(),
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [count, setCount] = useState(0);

  const channelReady = ContactAPI.isConfigured();

  /*
    The counter is presentational only and starts at zero.

    It is deliberately not seeded from the DOM on mount: doing so means writing
    state from an effect, and the gain is not worth it. Text typed before
    hydration is still in the node, and the very next keystroke updates the
    count — while validation and submit read `readForm()` straight from the DOM,
    so nothing that matters is ever derived from this number.
  */
  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  function validate(values) {
    const next = {};

    if (!values.name) next.name = t("contact.validation.nameRequired");

    if (!values.email) next.email = t("contact.validation.emailRequired");
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      next.email = t("contact.validation.emailInvalid");

    if (!values.subject) next.subject = t("contact.validation.subjectRequired");

    if (!values.message) next.message = t("contact.validation.messageRequired");
    else if (values.message.length < MESSAGE_MIN)
      next.message = t("contact.validation.messageMin");
    else if (values.message.length > MESSAGE_MAX)
      next.message = t("contact.validation.messageMax", { max: MESSAGE_MAX });

    setErrors(next);
    return next;
  }

  /** Move focus to the first field that failed, so the error is never offscreen. */
  function focusFirstError(next) {
    const order = [
      ["name", nameRef],
      ["email", emailRef],
      ["subject", subjectRef],
      ["message", messageRef],
    ];
    for (const [field, ref] of order) {
      if (next[field]) {
        ref.current?.focus();
        return;
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (loading) return; // no duplicate submission
    setFormError("");

    const values = readForm();
    const next = validate(values);

    if (Object.keys(next).length > 0) {
      focusFirstError(next);
      return;
    }

    setLoading(true);

    ContactAPI.sendMessage(values)
      .then(() => {
        // Only reachable after a real 2xx from a real endpoint.
        setToast(t("contact.form.heading"));
        formRef.current?.reset();
        setCount(0);
      })
      .catch((err) => {
        setFormError(
          err instanceof ContactChannelUnavailableError
            ? t("contact.unavailable.error")
            : err?.message || t("contact.unavailable.error")
        );
      })
      .finally(() => setLoading(false));
  }

  const fieldId = (name) => `${uid}-${name}`;
  const errorId = (name) => `${uid}-${name}-error`;
  const hintId = `${uid}-message-hint`;

  const describedBy = (name, extra) =>
    [errors[name] ? errorId(name) : null, extra].filter(Boolean).join(" ") || undefined;

  return (
    <section className={styles.formPanel} aria-labelledby={`${uid}-heading`}>
      <Toast message={toast} onClose={() => setToast("")} />

      <header className={styles.panelHeader}>
        <h2 id={`${uid}-heading`} className={styles.panelTitle}>
          {t("contact.form.heading")}
        </h2>
        <p className={styles.panelDescription}>{t("contact.form.description")}</p>
      </header>

      {/*
        Stated before the visitor writes anything rather than after they press
        send. The form below is genuinely wired; there is just no service behind
        it in this environment, and letting someone compose a long message under
        the impression it will arrive would be the dishonest option.
      */}
      {!channelReady ? (
        <div className={styles.notice} role="note">
          <FiInfo aria-hidden="true" className={styles.noticeIcon} />
          <div>
            <p className={styles.noticeTitle}>{t("contact.unavailable.title")}</p>
            <p className={styles.noticeBody}>{t("contact.unavailable.body")}</p>
          </div>
        </div>
      ) : null}

      {/*
        No `action` and no `name` attributes: submission is entirely a client
        concern, and the default button stays disabled until hydration, so there
        is no native GET that could put a visitor's message into a URL.
      */}
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={onSubmit}
        noValidate
        aria-label={t("contact.form.formLabel")}
      >
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId("name")}>
              {t("contact.form.name")}
              <span className={styles.req} aria-hidden="true">*</span>
              <span className="visually-hidden">{t("contact.form.required")}</span>
            </label>
            <input
              ref={nameRef}
              id={fieldId("name")}
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              type="text"
              autoComplete="name"
              placeholder={t("contact.form.namePlaceholder")}
              defaultValue=""
              required
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={describedBy("name")}
              onChange={() => clearError("name")}
            />
            {errors.name ? (
              <p className={styles.error} id={errorId("name")}>
                <FiAlertCircle aria-hidden="true" />
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldId("email")}>
              {t("contact.form.email")}
              <span className={styles.req} aria-hidden="true">*</span>
              <span className="visually-hidden">{t("contact.form.required")}</span>
            </label>
            <input
              ref={emailRef}
              id={fieldId("email")}
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("contact.form.emailPlaceholder")}
              defaultValue=""
              required
              dir="ltr"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={describedBy("email")}
              onChange={() => clearError("email")}
            />
            {errors.email ? (
              <p className={styles.error} id={errorId("email")}>
                <FiAlertCircle aria-hidden="true" />
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("subject")}>
            {t("contact.form.subject")}
            <span className={styles.req} aria-hidden="true">*</span>
            <span className="visually-hidden">{t("contact.form.required")}</span>
          </label>
          <div className={styles.selectWrap}>
            <select
              ref={subjectRef}
              id={fieldId("subject")}
              className={`${styles.select} ${errors.subject ? styles.inputError : ""}`}
              defaultValue=""
              required
              aria-invalid={errors.subject ? "true" : undefined}
              aria-describedby={describedBy("subject")}
              onChange={() => clearError("subject")}
            >
              <option value="" disabled>
                {t("contact.form.subjectPlaceholder")}
              </option>
              {SUBJECTS.map((key) => (
                <option key={key} value={key}>
                  {t(`contact.form.subjects.${key}`)}
                </option>
              ))}
            </select>
          </div>
          {errors.subject ? (
            <p className={styles.error} id={errorId("subject")}>
              <FiAlertCircle aria-hidden="true" />
              {errors.subject}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={fieldId("message")}>
            {t("contact.form.message")}
            <span className={styles.req} aria-hidden="true">*</span>
            <span className="visually-hidden">{t("contact.form.required")}</span>
          </label>
          <textarea
            ref={messageRef}
            id={fieldId("message")}
            className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
            rows={7}
            maxLength={MESSAGE_MAX}
            placeholder={t("contact.form.messagePlaceholder")}
            defaultValue=""
            required
            aria-invalid={errors.message ? "true" : undefined}
            aria-describedby={describedBy("message", hintId)}
            onChange={(e) => {
              setCount(e.target.value.length);
              clearError("message");
            }}
          />
          <div className={styles.fieldFoot}>
            {errors.message ? (
              <p className={styles.error} id={errorId("message")}>
                <FiAlertCircle aria-hidden="true" />
                {errors.message}
              </p>
            ) : (
              <span />
            )}
            <p className={styles.counter} id={hintId}>
              {t("contact.form.messageHint", { count, max: MESSAGE_MAX })}
            </p>
          </div>
        </div>

        {/* Announced when it appears; the text the visitor wrote is never cleared. */}
        {formError ? (
          <p className={styles.formError} role="alert">
            <FiAlertCircle aria-hidden="true" />
            {formError}
          </p>
        ) : null}

        {/*
          Disabled until hydration for the same reason as sign-in: sending is a
          client concern, so a pre-hydration submit would only trigger the
          browser's default navigation and discard the message. Disabling the
          default button also suppresses Enter-to-submit, which is the same trap
          reached by a different key.
        */}
        <button
          type="submit"
          className={styles.submit}
          disabled={loading || !hydrated}
        >
          <FiSend aria-hidden="true" />
          <span>{loading ? t("contact.form.submitting") : t("contact.form.submit")}</span>
        </button>
      </form>
    </section>
  );
}
