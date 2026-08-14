"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { onboardingSlides } from "@/data/onboarding";
import { SlideArt } from "@/components/auth/SlideArt";

type MobileOnboardingProps = {
  /** Called when the user finishes or skips — hands control to the signup form. */
  onDone: () => void;
};

export function MobileOnboarding({ onDone }: MobileOnboardingProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === onboardingSlides.length - 1;
  const slide = onboardingSlides[index];

  const goNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="Welcome to Chusec">
      <button type="button" className="onboarding__skip" onClick={onDone}>
        Skip
      </button>

      <div className="onboarding__body">
        <SlideArt art={slide.art} />
        <div className="promo-slide" data-state="active" key={slide.id}>
          <div>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
          </div>
        </div>
      </div>

      <div className="onboarding__footer">
        <div className="promo-dots promo-dots--static" aria-hidden="true">
          {onboardingSlides.map((item, itemIndex) => (
            <span
              key={item.id}
              className={itemIndex === index ? "promo-dots__dot is-active" : "promo-dots__dot"}
            />
          ))}
        </div>

        <button type="button" className="onboarding__next" onClick={goNext}>
          {isLast ? "Get Started" : "Next"}
          <ArrowRight size={17} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
