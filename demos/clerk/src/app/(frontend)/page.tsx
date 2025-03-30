import { HeroSection } from '@/blocks/hero-section'
import { FeaturesSection } from '@/blocks/features-section'
import { Main } from '@/components/main'

export default function Home() {
  return (
    <Main>
      <HeroSection />
      <FeaturesSection />
    </Main>
  )
}
