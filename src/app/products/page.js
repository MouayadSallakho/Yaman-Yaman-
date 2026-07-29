import { Suspense } from "react";

import Footer from "@/components/footer/Footer";
import ShopPage from "@/components/shop/ShopPage";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.products.title"),
    description: t("metadata.products.description"),
  };
}

export default function ProductsPage() {
  return (
    <>
      {/* ShopPage reads filter state from the URL via useSearchParams, which
          requires a Suspense boundary. The shop renders its own skeletons, so
          the fallback here only covers the boundary itself. */}
      <Suspense fallback={null}>
        <ShopPage />
      </Suspense>
      <Footer />
    </>
  );
}
