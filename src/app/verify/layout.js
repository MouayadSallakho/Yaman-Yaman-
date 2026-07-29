import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.verify.title"),
    description: t("metadata.verify.description"),
  };
}

export default function VerifyLayout({ children }) {
  return children;
}
