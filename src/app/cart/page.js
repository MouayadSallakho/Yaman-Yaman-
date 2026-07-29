import CartPageContent from "@/components/cart/CartPageContent";
import Footer from "@/components/footer/Footer";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.cart.title"),
    description: t("metadata.cart.description"),
  };
}

export default function CartPage() {
  return (
    <>
      <CartPageContent />
      {/* Sibling of the page content, exactly as the other routes do it. */}
      <Footer />
    </>
  );
}
