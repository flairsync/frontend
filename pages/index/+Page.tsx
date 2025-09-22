import SectionVisibilityHelper from '@/components/helpers/SectionVisibilityHelper';
import FeaturesSection from '@/components/landing/FeaturesSection';
import IntegrationSection from '@/components/landing/IntegrationSection';
import InventoryManagementFeature from '@/components/landing/InventoryManagementFeature';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingHero from '@/components/landing/LandingHero';
import LandingPricingSection from '@/components/landing/LandingPricingSection';
import ProblemSolutionSection from '@/components/landing/ProblemSolutionSection';
import StaffManagementFeature from '@/components/landing/StaffManagementFeature';
import { useSectionObserver } from '@/hooks/useSectionObserver';
import { clientOnly } from 'vike-react/clientOnly'

const LandingHeader = clientOnly(() => import("@/components/landing/LandingHeader"));
const ScrollArrow = clientOnly(() => import("@/components/landing/AnimatedScrollArrow"));


const ScrollMoreArrow = () => {
  return <div
    className='relative md:top-24'
  >
    <ScrollArrow
    />
  </div>

}

export default function Page() {

  const sectionIds = ["home", "features", "prob_solution", "integration", "pricing", "faq"];

  const activeTag = useSectionObserver(sectionIds);

  return (
    <div
      className='scroll-container max-w-screen overflow-hidden'
    >
      <LandingHeader
        activeTag={activeTag}
      />
      <div
        className='pt-50 md:pt-20 gap-10 flex flex-col'
      >
        <div
          id='home'
        >

          <LandingHero />
          <div
            className='md:pt-30 md:pb-10 lg:pt-0 lg:pb-0'
          >
            <ScrollMoreArrow />

          </div>
        </div>

        <div
          id='features'
        >
          <FeaturesSection />
          <InventoryManagementFeature />
          <StaffManagementFeature />
        </div>
        <div
          id='prob_solution'
          className='pt-10 pb-10'
        >
          <ProblemSolutionSection />
        </div>
        <div
          id='integration'
        >
          <IntegrationSection />
        </div>
        <div
          id='pricing'
        >
          <LandingPricingSection />
        </div>
        <div
          id='faq'
        >
          <LandingFaqSection />
        </div>

      </div>
      <LandingFooter />
    </div>
  );
}
