"use client";

import { useRef } from "react";
import AssetImage from "@/components/ui/AssetImage/AssetImage";
import TechnoLogo from "@/components/brand/TechnoLogo/TechnoLogo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { heroProducts } from "../data/heroProducts";
import { useTranslation } from "@/i18n/LocaleProvider";
import styles from "./CinematicIntro.module.css";

gsap.registerPlugin(useGSAP);

// Absolute fail-safe: the overlay must never outlive this, even on error.
const MAX_DURATION_MS = 4200;

// The intro orbit has exactly three positioned slots (.orbit0/1/2). Only show
// those three products; the fuller queue lives in the homepage hero carousel.
// (Rendering more here would leave the extras unpositioned, stacked dead-centre
// over the Techno Solutions logo.)
const INTRO_ORBIT_PRODUCTS = heroProducts.slice(0, 3);

/**
 * "Techno Solutions — Enter the Future of Technology" cinematic intro.
 *
 * A full-screen fixed overlay that opens like an iris portal to reveal the
 * landing page. It is decorative: the scene is aria-hidden, only the Skip
 * control is exposed to assistive tech. Escape or Skip run the same completion
 * path. All timers/listeners/timelines are cleaned up on unmount.
 *
 * Flash-free contract with the orchestrator:
 * - Visibility of this shell on the first paint is owned by CSS via the
 *   `data-mabco-intro` attribute (set by the root-layout boot script). This
 *   component never toggles that; it only drives GSAP and reports completion.
 * - The animated scene starts CSS-hidden (`visibility: hidden`) and is revealed
 *   by GSAP together with its from-states, so nothing "jumps" when GSAP inits.
 * - The body scroll-lock is CSS-driven (data attribute), not set here.
 *
 * @param {{ onComplete: () => void }} props
 */
export default function CinematicIntro({ onComplete }) {
  const { t } = useTranslation();
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const completedRef = useRef(false);
  const failSafeRef = useRef(null);

  useGSAP(
    (_ctx, contextSafe) => {
      // ---- single completion path (idempotent) ----
      const complete = () => {
        if (completedRef.current) return;
        completedRef.current = true;
        if (failSafeRef.current) clearTimeout(failSafeRef.current);
        document.removeEventListener("keydown", onKey);
        onComplete?.(); // orchestrator releases the CSS lock + reveals the hero
      };

      const skip = contextSafe(() => {
        if (completedRef.current) return;
        const tl = tlRef.current;
        if (tl) {
          // fast-forward to the portal reveal; tl.onComplete -> complete()
          tl.tweenTo(tl.totalDuration(), { duration: 0.5, ease: "power2.in" });
        } else {
          complete();
        }
      });

      const onKey = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          skip();
        }
      };
      document.addEventListener("keydown", onKey);

      // Fail-safe: force completion if the timeline stalls / errors.
      failSafeRef.current = setTimeout(complete, MAX_DURATION_MS);

      const skipBtn = rootRef.current.querySelector(`.${styles.skip}`);
      skipBtn?.addEventListener("click", skip);

      const q = gsap.utils.selector(rootRef);
      const mm = gsap.matchMedia(rootRef);

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 992px)",
          mobile: "(max-width: 991.98px)",
        },
        (ctx) => {
          // Reduced-motion users shouldn't normally reach here (the orchestrator
          // skips the cinematic motion), but if they do, complete immediately.
          if (ctx.conditions.reduce) {
            complete();
            return;
          }

          const mobile = ctx.conditions.mobile;
          const reach = mobile ? 0.62 : 1; // shorter travel on small screens

          // Reveal the scene in the same synchronous pass that GSAP sets the
          // from-states, so no content is ever painted in its final position
          // before the animation begins.
          gsap.set(q('[data-intro="scene"]'), { visibility: "visible" });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: complete,
          });
          tl.timeScale(1.7);
          tlRef.current = tl;

          // ---- Scene A — signal ignition + approved wordmark reveal ----
          tl.fromTo(
            q('[data-intro="glow"]'),
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.7 },
            0
          )
            .from(
              q('[data-intro="brandLogo"]'),
              { y: 30, scale: 0.9, opacity: 0, duration: 0.82 },
              0.18
            )
            .from(
              q('[data-intro="tagline"]'),
              { y: 18, opacity: 0, duration: 0.62 },
              0.82
            )

            // ---- Scene C — technology orbit (with a hold to breathe) ----
            .fromTo(
              q('[data-intro="orbit"]'),
              { opacity: 0, scale: 0.7 },
              { opacity: 1, scale: 1, duration: 0.7 },
              1.9
            )
            .from(
              q('[data-intro="orbitItem"]'),
              {
                scale: 0.2,
                opacity: 0,
                duration: 0.7,
                stagger: 0.14,
                ease: "back.out(1.6)",
              },
              2.0
            )
            .fromTo(
              q('[data-intro="orbit"]'),
              { rotation: -34 * reach },
              { rotation: 30 * reach, duration: 1.8, ease: "sine.inOut" },
              2.0
            )
            .fromTo(
              q('[data-intro="orbitItem"]'),
              { rotation: 34 * reach },
              { rotation: -30 * reach, duration: 1.8, ease: "sine.inOut" },
              2.0
            )

            // ---- Scene D — portal transformation ----
            .to(
              q('[data-intro="orbitItem"]'),
              {
                x: 0,
                y: 0,
                scale: 0.15,
                opacity: 0,
                duration: 0.55,
                stagger: 0.06,
                ease: "power2.in",
              },
              3.7
            )
            .to(
              q('[data-intro="wordmarkWrap"]'),
              { y: -22, scale: 0.9, opacity: 0, duration: 0.5 },
              3.75
            )
            .to(
              q('[data-intro="glow"]'),
              { scale: 3.4, opacity: 0.9, duration: 0.85, ease: "power2.inOut" },
              3.9
            )
            // The iris: animate the backdrop mask hole open to reveal the page.
            .to(
              q('[data-intro="backdrop"]'),
              { "--portal": "165%", duration: 0.9, ease: "power2.inOut" },
              3.95
            )
            .to(q('[data-intro="glow"]'), { opacity: 0, duration: 0.35 }, 4.6);

          // ---- Skip control: reveal after a short beat ----
          gsap.fromTo(
            skipBtn,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, delay: 0.35, ease: "power2.out" }
          );

          return () => {
            tl.kill();
          };
        }
      );

      // ---- cleanup on unmount (covers unexpected teardown) ----
      return () => {
        if (failSafeRef.current) clearTimeout(failSafeRef.current);
        document.removeEventListener("keydown", onKey);
        skipBtn?.removeEventListener("click", skip);
      };
    },
    { scope: rootRef }
  );

  return (
    <div className={`${styles.root} mabco-intro-shell`} ref={rootRef}>
      <div className={styles.backdrop} data-intro="backdrop" aria-hidden="true" />

      <div className={styles.scene} data-intro="scene" aria-hidden="true">
        <span className={styles.glow} data-intro="glow" />


        <div className={styles.wordmarkWrap} data-intro="wordmarkWrap">
          <div className={styles.wordmark} data-intro="brandLogo">
            <TechnoLogo
              variant="light"
              decorative
              className={styles.introBrand}
              sizes="(max-width: 575px) 220px, 430px"
            />
          </div>
          <p className={styles.tagline} data-intro="tagline">
            {t("intro.tagline")}
          </p>
        </div>

        <div className={styles.orbit} data-intro="orbit">
          {INTRO_ORBIT_PRODUCTS.map((product, i) => (
            <span
              key={product.id}
              className={`${styles.orbitItem} ${styles[`orbit${i}`]}`}
              data-intro="orbitItem"
            >
              <AssetImage
                src={product.image}
                alt=""
                width={120}
                height={120}
                wrapperClassName={styles.orbitAsset}
                className={styles.orbitImg}
                placeholderLabel={product.name}
                showPath={false}
                priority={i === 0}
              />
            </span>
          ))}
        </div>
      </div>

      <button type="button" className={styles.skip}>
        {t("intro.skip")}
      </button>
    </div>
  );
}
