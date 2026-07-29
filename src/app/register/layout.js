import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.register.title"),
    description: t("metadata.register.description"),
  };
}

export default function RegisterLayout({ children }) {
  return children;
}
