import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.dashboard.title"),
    description: t("metadata.dashboard.description"),
    // The admin dashboard must never be indexed.
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage() {
  const { t } = await getServerI18n();
  return (
    <main id="main-content" style={{ padding: 24 }}>
      <h1>{t("pages.dashboard.title")}</h1>
    </main>
  );
}
