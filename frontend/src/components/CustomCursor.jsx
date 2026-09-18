import { useEffect, useRef, useState } from "react";
import "../Style/CustomCursor.css";

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  const mouse = useRef({
    x: -100,
    y: -100,
  });

  const ring = useRef({
    x: -100,
    y: -100,
  });

  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    /*
      IMPORTANT FIX:
      Do NOT use:
      "ontouchstart" in window

      Some laptops support touch + mouse together.
      We only disable the custom cursor when the device
      actually uses a coarse pointer and has no hover.
    */
    const mobilePointer = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;

    if (mobilePointer) {
      return;
    }

    let animationFrame;

    /* =====================================================
       MOVE CURSOR
    ===================================================== */

    const moveCursor = (event) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;

      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `
          translate3d(
            ${event.clientX}px,
            ${event.clientY}px,
            0
          )
          translate(-50%, -50%)
        `;
      }
    };

    /* =====================================================
       SMOOTH OUTER RING
    ===================================================== */

    const animateRing = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.14;

      ring.current.y += (mouse.current.y - ring.current.y) * 0.14;

      if (ringRef.current) {
        ringRef.current.style.transform = `
          translate3d(
            ${ring.current.x}px,
            ${ring.current.y}px,
            0
          )
          translate(-50%, -50%)
        `;
      }

      animationFrame = requestAnimationFrame(animateRing);
    };

    /* =====================================================
       INTERACTIVE ELEMENT HOVER
    ===================================================== */

    const handlePointerOver = (event) => {
      const target = event.target.closest(
        `
          a,
          button,
          [data-cursor],
          input,
          textarea,
          select,
          [role="button"]
        `,
      );

      if (!target) return;

      setHovering(true);

      const text = target.getAttribute("data-cursor-text");

      setCursorText(text || "");
    };

    const handlePointerOut = (event) => {
      const target = event.target.closest(
        `
          a,
          button,
          [data-cursor],
          input,
          textarea,
          select,
          [role="button"]
        `,
      );

      if (!target) return;

      /*
        Prevent hover from resetting when moving
        between children inside the same button/link.
      */
      if (event.relatedTarget && target.contains(event.relatedTarget)) {
        return;
      }

      setHovering(false);
      setCursorText("");
    };

    /* =====================================================
       CLICK
    ===================================================== */

    const handlePointerDown = () => {
      setClicking(true);
    };

    const handlePointerUp = () => {
      setClicking(false);
    };

    /* =====================================================
       WINDOW LEAVE / ENTER
    ===================================================== */

    const handleLeave = () => {
      setVisible(false);
    };

    const handleEnter = () => {
      setVisible(true);
    };

    /* =====================================================
       EVENTS
    ===================================================== */

    window.addEventListener("pointermove", moveCursor);

    document.addEventListener("pointerover", handlePointerOver);

    document.addEventListener("pointerout", handlePointerOut);

    window.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("pointerup", handlePointerUp);

    document.addEventListener("mouseleave", handleLeave);

    document.addEventListener("mouseenter", handleEnter);

    animationFrame = requestAnimationFrame(animateRing);

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      window.removeEventListener("pointermove", moveCursor);

      document.removeEventListener("pointerover", handlePointerOver);

      document.removeEventListener("pointerout", handlePointerOut);

      window.removeEventListener("pointerdown", handlePointerDown);

      window.removeEventListener("pointerup", handlePointerUp);

      document.removeEventListener("mouseleave", handleLeave);

      document.removeEventListener("mouseenter", handleEnter);

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      {/* OUTER RING */}
      <div
        ref={ringRef}
        className={`
          custom-cursor-ring
          ${visible ? "is-visible" : ""}
          ${hovering ? "is-hovering" : ""}
          ${clicking ? "is-clicking" : ""}
          ${cursorText ? "has-text" : ""}
        `}
      >
        <span className="cursor-text">{cursorText}</span>

        {!cursorText && hovering && <span className="cursor-arrow">↗</span>}
      </div>

      {/* DOT */}
      <div
        ref={dotRef}
        className={`
          custom-cursor-dot
          ${visible ? "is-visible" : ""}
          ${hovering ? "is-hovering" : ""}
          ${clicking ? "is-clicking" : ""}
        `}
      />
    </>
  );
}
