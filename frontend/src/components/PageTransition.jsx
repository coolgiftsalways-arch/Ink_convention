import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "../Style/BarbaTransitions.css";

/**
 * INK CONVENTION — premium 3D page reveal.
 * Visual transition only: does not touch routes, APIs or backend logic.
 */
export default function PageTransition({ children }) {
  const overlayRef = useRef(null);
  const topColRef = useRef(null);
  const bottomColRef = useRef(null);
  const logoRef = useRef(null);
  const subtitleRef = useRef(null);
  const lineRef = useRef(null);
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const overlay = overlayRef.current;
      const top = topColRef.current;
      const bottom = bottomColRef.current;
      const logo = logoRef.current;
      const subtitle = subtitleRef.current;
      const line = lineRef.current;
      const page = containerRef.current;

      if (!overlay || !top || !bottom || !logo || !subtitle || !line || !page) {
        return;
      }

      // Respect visitors who prefer little or no animation.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(logo, { autoAlpha: 0 });
        gsap.set(page, { clearProps: "all", autoAlpha: 1 });
        return;
      }

      gsap.set(overlay, { autoAlpha: 1 });
      gsap.set(top, {
        rotationX: 0,
        yPercent: 0,
        autoAlpha: 1,
        transformOrigin: "top center",
        force3D: true,
      });
      gsap.set(bottom, {
        rotationX: 0,
        yPercent: 0,
        autoAlpha: 1,
        transformOrigin: "bottom center",
        force3D: true,
      });
      gsap.set(logo, {
        autoAlpha: 0,
        y: 24,
        scale: 0.94,
        filter: "blur(8px)",
      });
      gsap.set(subtitle, { autoAlpha: 0, y: 10 });
      gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
      gsap.set(page, { autoAlpha: 0, y: 20 });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      timeline
        // The identity arrives cleanly, without neon/glow effects.
        .to(logo, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.52,
        })
        .to(line, { scaleX: 1, duration: 0.43 }, "-=0.33")
        .to(subtitle, { autoAlpha: 1, y: 0, duration: 0.35 }, "-=0.35")
        // The panels fold away simultaneously to show the next page.
        .to(logo, { autoAlpha: 0, y: -12, duration: 0.24 }, "+=0.18")
        .to(subtitle, { autoAlpha: 0, y: -8, duration: 0.2 }, "<")
        .to(
          top,
          {
            rotationX: -98,
            yPercent: -6,
            autoAlpha: 0,
            duration: 0.82,
            ease: "power4.inOut",
          },
          "-=0.04",
        )
        .to(
          bottom,
          {
            rotationX: 98,
            yPercent: 6,
            autoAlpha: 0,
            duration: 0.82,
            ease: "power4.inOut",
          },
          "<",
        )
        .to(
          page,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
          },
          "<+=0.17",
        )
        .set(overlay, { autoAlpha: 0 })
        .set(page, { clearProps: "transform,visibility", opacity: 1 });
    });

    return () => context.revert();
  }, []);

  return (
    <>
      <div
        ref={overlayRef}
        className="barba-transition-overlay"
        aria-hidden="true"
      >
        <div ref={topColRef} className="barba-col barba-col-top" />
        <div ref={bottomColRef} className="barba-col barba-col-bottom" />

        <div ref={logoRef} className="transition-center-logo">
          <div className="transition-brand-label">INK CONVENTION</div>
          <div className="transition-brand-name">
            EXPO<span>2026.</span>
          </div>
          <div ref={lineRef} className="transition-brand-line" />
          <div ref={subtitleRef} className="transition-brand-subtitle">
            TATTOO / ART / CULTURE
          </div>
        </div>
      </div>

      <div ref={containerRef} className="page-transition-content">
        {children}
      </div>
    </>
  );
}
