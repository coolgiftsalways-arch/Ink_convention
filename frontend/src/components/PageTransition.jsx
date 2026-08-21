import { useEffect, useRef } from "react";
import gsap from "gsap";
import "../Style/BarbaTransitions.css";

export default function PageTransition({ children }) {
  const containerRef = useRef(null);
  const topColRef = useRef(null);
  const bottomColRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initialize: Panels start flat covering the screen with 3D transform origins
    tl.set(topColRef.current, { rotationX: 0, transformOrigin: "top center" })
      .set(bottomColRef.current, {
        rotationX: 0,
        transformOrigin: "bottom center",
      })
      .set(logoRef.current, {
        opacity: 0,
        scale: 0.8,
        z: -100,
        filter: "blur(12px)",
      })
      .set(containerRef.current, { opacity: 0 })

      // 3D pop-in for the center logo
      .to(logoRef.current, {
        opacity: 1,
        scale: 1,
        z: 0,
        filter: "blur(0px)",
        duration: 0.35,
        ease: "power3.out",
      })
      .to(logoRef.current, { opacity: 1, duration: 0.15 })

      // Fade out logo and reveal page
      .to(logoRef.current, { opacity: 0, scale: 1.1, duration: 0.15 }, "+=0.02")
      .to(containerRef.current, { opacity: 1, duration: 0.25 }, "-=0.1")

      // 3D Flip open: Top panel rotates backwards/up, Bottom panel rotates forwards/down
      .to(topColRef.current, {
        rotationX: -90,
        opacity: 0,
        duration: 0.55,
        ease: "power4.inOut",
      })
      .to(
        bottomColRef.current,
        {
          rotationX: 90,
          opacity: 0,
          duration: 0.55,
          ease: "power4.inOut",
        },
        "<", // Runs simultaneously with the top panel flip
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* 3D Perspective Wrapper */}
      <div className="barba-transition-overlay">
        <div ref={topColRef} className="barba-col barba-col-top" />
        <div ref={bottomColRef} className="barba-col barba-col-bottom" />
      </div>

      {/* Centered Logo */}
      <div ref={logoRef} className="transition-center-logo">
        EXPO2026<span className="text-[#06b6d4]">.</span>
      </div>

      <div ref={containerRef}>{children}</div>
    </>
  );
}
