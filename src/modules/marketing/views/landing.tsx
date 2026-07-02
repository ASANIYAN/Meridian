import { AiChatSpotlight } from '../components/ai-chat-spotlight'
import { ClosingCtaSection } from '../components/closing-cta-section'
import { HeroSection } from '../components/hero-section'
import { HowItWorksSection } from '../components/how-it-works-section'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingNav } from '../components/marketing-nav'
import { ProseSection } from '../components/prose-section'
import { RolesSection } from '../components/roles-section'
import { TrustSection } from '../components/trust-section'

/**
 * The public landing page at `/` (logged-out visitors only — see
 * `HomeRoute` in the router). Dark `.chart` register bookends the page
 * (hero, closing CTA + footer); the body sections run in the light
 * vellum register — see CLAUDE.md's marketing-page plan for why.
 */
export function LandingView() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="chart bg-background text-foreground">
        <MarketingNav />
        <HeroSection />
      </div>

      <ProseSection />
      <RolesSection />
      <AiChatSpotlight />
      <TrustSection />
      <HowItWorksSection />

      <div className="chart bg-background text-foreground">
        <ClosingCtaSection />
        <MarketingFooter />
      </div>
    </div>
  )
}
