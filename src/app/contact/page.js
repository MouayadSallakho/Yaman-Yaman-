import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.contact.title"),
    description: t("metadata.contact.description"),
  };
}

export default async function ContactPage() {
  const { t } = await getServerI18n();
  return (
    <main id="main-content" style={{ padding: 24 }}>
      <h1>{t("pages.contact.title")}</h1>
    </main>
  );
}
