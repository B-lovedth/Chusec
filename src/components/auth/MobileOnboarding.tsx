"use client";

import { useState } from "react";
import { onboardingSlides } from "@/data/onboarding";
import { SlideArt } from "@/components/auth/SlideArt";

type MobileOnboardingProps = {
  /** Called when the last slide is finished — hands over to the signup form. */
  onDone: () => void;
};

export function MobileOnboarding({ onDone }: MobileOnboardingProps) {
  const [index, setIndex] = useState(0);
  const slide = onboardingSlides[index];

  const advance = () => {
    if (index === onboardingSlides.length - 1) {
      onDone();
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Welcome to Chusec">
      <div className="onboarding__art" key={slide.id}>
        <SlideArt slide={slide} />
      </div>

      <div className="onboarding__card">
        <h2 className="onboarding__title">{slide.title}</h2>
        <p className="onboarding__text">{slide.description}</p>

        <div className="promo-dots promo-dots--dark" aria-hidden="true">
          {onboardingSlides.map((item, itemIndex) => (
            <span
              key={item.id}
              className={itemIndex === index ? "promo-dots__dot is-active" : "promo-dots__dot"}
            />
          ))}
        </div>

        <button type="button" className="btn btn--primary onboarding__cta" onClick={advance}>
          Get Started
        </button>
      </div>
    </div>
  );
}
