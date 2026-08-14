"use client";

import { useEffect, useState } from "react";
import { AuthExperience } from "@/components/auth/AuthExperience";

type HeroSlide = {
  title: string;
  description: string;
  leftTag: string;
  rightTag: string;
  rightTagAlt?: boolean;
};

const heroSlides: HeroSlide[] = [
  {
    title: "Community Safety",
    description:
      "Live, crowd-sourced incident reports from thousands of Nigerians on the road. Warri, Asaba, Benin City. Every corridor, every minute.",
    leftTag: "Danger",
    rightTag: "Kia",
  },
  {
    title: "Incident Alerts",
    description:
      "Receive route-level warnings in real time and avoid conflict spots before you get there. Built for drivers, commuters and local dispatch teams.",
    leftTag: "Report",
    rightTag: "SUV",
    rightTagAlt: true,
  },
  {
    title: "Verified Reports",
    description:
      "Track trusted updates from nearby users and quickly notify your community. Stay informed with one clear feed of incidents around you.",
    leftTag: "Trusted",
    rightTag: "Road",
  },
];

export default function SignupPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="auth-shell auth-shell--signup">
      <section className="auth-hero-panel" aria-label="Community safety panel">
        <div className="auth-carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {heroSlides.map((slide, index) => (
            <article className="auth-carousel-slide" key={slide.title} aria-hidden={index !== activeSlide}>
              <div className="auth-hero-graphic" aria-hidden="true">
                <div className="signal-tag signal-tag--left">{slide.leftTag}</div>
                <div className={slide.rightTagAlt ? "signal-tag signal-tag--right signal-tag--right-alt" : "signal-tag signal-tag--right"}>
                  {slide.rightTag}
                </div>
                <div className="graph-grid" />
                <div className="alert-dot" />
                <div className="dashed-line" />
              </div>

              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
            </article>
          ))}
        </div>

        <div className="page-indicator" aria-label="Page indicator">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={index === activeSlide ? "page-indicator__dot is-active" : "page-indicator__dot"}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-pressed={index === activeSlide}
            />
          ))}
        </div>
      </section>

      <section className="auth-form-panel">
        <AuthExperience mode="signup" />
      </section>
    </main>
  );
}
