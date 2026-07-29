import Image from "next/image";
import styles from "./TechnoLogo.module.css";

const ASSETS = {
  dark: "/brand/techno-solutions-logo-dark.png",
  light: "/brand/techno-solutions-logo-light.png",
};

export default function TechnoLogo({
  variant = "dark",
  priority = false,
  className = "",
  decorative = false,
  sizes = "(max-width: 575px) 116px, 154px",
}) {
  const src = ASSETS[variant] || ASSETS.dark;

  return (
    <span className={`${styles.frame} ${className}`.trim()}>
      <Image
        src={src}
        alt={decorative ? "" : "Techno Solutions"}
        width={811}
        height={221}
        priority={priority}
        sizes={sizes}
        className={styles.image}
      />
    </span>
  );
}
