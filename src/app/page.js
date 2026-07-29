import Footer from "@/components/footer/Footer";
import LandingExperience from "@/components/landing/LandingExperience/LandingExperience";
import BrandShowcaseSection from "@/components/landing/BrandShowcase/BrandShowcaseSection";
import NewArrivalsSection from "@/components/landing/NewArrivals/NewArrivalsSection";
import PulseCommerceHero from "@/components/landing/PulseCommerceHero/PulseCommerceHero";
import PromoRow from "@/components/landing/PromoRow/PromoRow";
import TodaysPicksSection from "@/components/landing/TodaysPicks/TodaysPicksSection";
import { getServerI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getServerI18n();
  return {
    title: t("metadata.home.title"),
    description: t("metadata.home.description"),
  };
}

export default function Home() {
  return (
    <>
      <main id="main-content">
        {/* Cinematic intro overlay controller (plays, then reveals the page). */}
        <LandingExperience />
        {/* The unified Techno Solutions Pulse Commerce Core: Category Reactor,
            Deals Matrix and Top Seller Vault. */}
        <PulseCommerceHero />
        <NewArrivalsSection />
        <TodaysPicksSection />
        <BrandShowcaseSection />
        <PromoRow />
      </main>
      <Footer />
    </>
  );
}
