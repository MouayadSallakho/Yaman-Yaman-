import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.login.title"),
    description: t("metadata.login.description"),
  };
}

export default function LoginLayout({ children }) {
  return children;
}
