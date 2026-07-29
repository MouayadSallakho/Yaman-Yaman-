import Footer from "@/components/footer/Footer";
import XiomaX15UltraPage from "@/components/product-details/XiomaX15Ultra/XiomaX15UltraPage";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.xiomaX15Ultra.title"),
    description: t("metadata.xiomaX15Ultra.description"),
  };
}

export default function XiomaProductDemoRoute() {
  return (
    <>
      <XiomaX15UltraPage />
      <Footer />
    </>
  );
}
