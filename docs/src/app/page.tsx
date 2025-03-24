import { getGitHubStars } from "@/lib/get-github-stars";
import Section from "@/components/landing/section";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";

export default async function HomePage() {
  const stars = await getGitHubStars();
  return (
    <main className="h-min mx-auto overflow-x-hidden">
      <Section
        className="mb-1 overflow-y-clip"
        crosses
        crossesOffset="lg:translate-y-[5.25rem]"
        customPaddings
        id="hero"
      >
        <Hero />
        <Features stars={stars} />
        <hr className="h-px bg-gray-200" />
      </Section>
    </main>
  );
}
