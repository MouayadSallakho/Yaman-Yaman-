"use client";

import { FiAward, FiZap, FiShield, FiTruck } from "react-icons/fi";

import styles from "./BrandShowcaseSection.module.css";

const ICONS = {
  shield: FiShield,
  truck: FiTruck,
  award: FiAward,
  rocket: FiZap,
};

export default function BrandBenefitsStrip({ benefits, t }) {
  return (
    <div className={styles.benefitsStrip} data-brand-showcase-benefits>
      {benefits.map((benefit) => {
        const Icon = ICONS[benefit.icon] ?? FiShield;
        return (
          <div className={styles.benefitItem} key={benefit.id}>
            <span className={styles.benefitIcon} aria-hidden="true">
              <Icon />
            </span>
            <span className={styles.benefitCopy}>
              <strong>{t(benefit.titleKey)}</strong>
              <span>{t(benefit.descriptionKey)}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
