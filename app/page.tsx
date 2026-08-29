import { Agenda } from "@/components/landing/agenda";
import { Awards } from "@/components/landing/awards";
import { Footer } from "@/components/landing/footer";
import { Gallery } from "@/components/landing/gallery";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Info } from "@/components/landing/info";
import { Merch } from "@/components/landing/merch";
import { Rules } from "@/components/landing/rules";
import { Sponsors } from "@/components/landing/sponsors";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Info />
        <Rules />
        <Sponsors />
        <Awards />
        <Agenda />
        <Merch />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
