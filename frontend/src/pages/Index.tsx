import { FeaturesSection } from "../components/sections/FeaturesSection";
import { FaqSection } from "../components/sections/FaqSection";
import { HeroSection } from "../components/sections/HeroSection";
import { HowItWorksSection } from "../components/sections/HowItWorksSection";
import { RatesSection } from "../components/sections/RatesSection";
import { SupportedSection } from "../components/sections/SupportedSection";
import { DeveloperSection } from "../components/sections/DeveloperSection";
import { UserFeedbackSection } from "../components/sections/UserFeedbackSection";

export default function Index() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RatesSection />
      <SupportedSection />
      <DeveloperSection />
      <UserFeedbackSection />
      <FaqSection />
    </div>
  );
}
