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

  useEffect(() => {
    // don't use custom cursor on touch/mobile
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isTouch) return;

    let animationFrame;

    const moveCursor = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `
          translate3d(
            ${e.clientX}px,
            ${e.clientY}px,
            0
          )
          translate(-50%, -50%)
        `;
      }
    };

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

    const handleMouseOver = (e) => {
      const target = e.target.closest(
        "a, button, [data-cursor], input, textarea, select",
      );

      if (!target) return;

      setHovering(true);

      const text = target.getAttribute("data-cursor-text");

      if (text) {
        setCursorText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest(
        "a, button, [data-cursor], input, textarea, select",
      );

      if (!target) return;

      setHovering(false);
      setCursorText("");
    };

    const handleMouseDown = () => {
      setClicking(true);
    };

    const handleMouseUp = () => {
      setClicking(false);
    };

    window.addEventListener("mousemove", moveCursor);

    document.addEventListener("mouseover", handleMouseOver);

    document.addEventListener("mouseout", handleMouseOut);

    window.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("mouseup", handleMouseUp);

    animationFrame = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", moveCursor);

      document.removeEventListener("mouseover", handleMouseOver);

      document.removeEventListener("mouseout", handleMouseOut);

      window.removeEventListener("mousedown", handleMouseDown);

      window.removeEventListener("mouseup", handleMouseUp);

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className={`
          custom-cursor-ring
          ${hovering ? "is-hovering" : ""}
          ${clicking ? "is-clicking" : ""}
          ${cursorText ? "has-text" : ""}
        `}
      >
        <span className="cursor-text">{cursorText}</span>

        {!cursorText && hovering && <span className="cursor-arrow">↗</span>}
      </div>

      <div
        ref={dotRef}
        className={`
          custom-cursor-dot
          ${hovering ? "is-hovering" : ""}
          ${clicking ? "is-clicking" : ""}
        `}
      />
    </>
  );
}
