"use client";

import { useEffect, useState } from "react";
import { onboardingSlides } from "@/data/onboarding";
import { SlideArt } from "@/components/auth/SlideArt";

const ROTATE_MS = 5000;

export function PromoPanel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % onboardingSlides.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = onboardingSlides[index];

  return (
    <section
      className="promo-panel"
      aria-roledescription="carousel"
      aria-label="What Chusec does"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="promo-panel__viewport">
        <article className="promo-slide" data-state="active" key={slide.id} aria-live="polite">
          <SlideArt slide={slide} />
          <div>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
          </div>
        </article>
      </div>

      <div className="promo-dots">
        {onboardingSlides.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            className={itemIndex === index ? "promo-dots__dot is-active" : "promo-dots__dot"}
            onClick={() => setIndex(itemIndex)}
            aria-label={`Show slide ${itemIndex + 1}: ${item.title}`}
            aria-current={itemIndex === index}
          />
        ))}
      </div>
    </section>
  );
}
