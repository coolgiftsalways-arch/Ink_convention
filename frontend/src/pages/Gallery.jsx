import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Camera, Film, Play, X } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import "../Style/Gallery.css";

/*
  INK CONVENTION — PREMIUM LIGHT GALLERY
  All original local gallery photos / videos are retained.
  Gallery captions do not invent artist names, origins or tattoo credits.
*/

import GAll1 from "../assets/gall1.jpg";
import GAll3 from "../assets/gall3.jpg";
import GAll4 from "../assets/gall4.jpg";
import GAll5 from "../assets/gall5.JPG";
import GAll6 from "../assets/gall6.PNG";
import GAll7 from "../assets/gall7.jpg";
import GAll8 from "../assets/gall8.jpg";
import GAll9 from "../assets/gall9.jpg";
import GAll11 from "../assets/gall11.jpg";
import GAll12 from "../assets/gall12.jpg";
import GAll13 from "../assets/gall13.jpg";
import GAll14 from "../assets/gall14.jpg";
import GAll15 from "../assets/gall15.jpg";
import GAll16 from "../assets/gall16.jpg";
import GAll17 from "../assets/gall17.jpg";
import GAll19 from "../assets/gall19.JPG";
import GAll20 from "../assets/gall20.JPG";
import GAll21 from "../assets/gall21.JPG";
import GAll22 from "../assets/gall22.JPG";
import GAll23 from "../assets/gall23.JPG";
import GAll24 from "../assets/gall24.JPG";
import GAll25 from "../assets/gall25.jpg";
import GAll26 from "../assets/gall26.jpg";
import GAll27 from "../assets/gall27.jpg";
import GAll28 from "../assets/gall28.jpg";
import GAll29 from "../assets/gall29.jpg";
import GAll30 from "../assets/gall30.jpg";
import GAll32 from "../assets/gall32.jpg";
import GAll33 from "../assets/gall33.jpg";
import GAll34 from "../assets/gall34.jpg";
import GAll35 from "../assets/gall35.jpg";
import GAll36 from "../assets/gall36.jpg";
import GAll37 from "../assets/gall37.jpg";
import GAll38 from "../assets/gall38.jpg";
import GAll39 from "../assets/gall39.jpg";
import GAll40 from "../assets/gall40.jpg";
import GAll41 from "../assets/gall41.jpg";
import GAll42 from "../assets/gall42.jpg";
import GAll43 from "../assets/gall43.jpg";
import GAll44 from "../assets/gall44.jpg";
import GAll45 from "../assets/gall45.jpg";
import GAll46 from "../assets/last.jpeg";

import VELL1 from "../assets/gall1.mp4";
import VELL2 from "../assets/gall2.mp4";
import VELL3 from "../assets/gall3.mp4";
import VELL4 from "../assets/gall4.mp4";
import VELL5 from "../assets/gall5.mp4";
import VELL6 from "../assets/gall6.mp4";
import VELL7 from "../assets/gall7.mp4";
import VELL8 from "../assets/gall8.mp4";
import VELL9 from "../assets/gall9.mp4";
import VELL10 from "../assets/gall10.mp4";
import VELL11 from "../assets/gall11.mp4";
import VELL12 from "../assets/gall12.mp4";

gsap.registerPlugin(ScrollTrigger);

const photos = [
  GAll1,
  GAll3,
  GAll4,
  GAll5,
  GAll6,
  GAll7,
  GAll8,
  GAll9,
  GAll11,
  GAll12,
  GAll13,
  GAll14,
  GAll15,
  GAll16,
  GAll17,
  GAll19,
  GAll20,
  GAll21,
  GAll22,
  GAll23,
  GAll24,
  GAll25,
  GAll26,
  GAll27,
  GAll28,
  GAll29,
  GAll30,
  GAll32,
  GAll33,
  GAll34,
  GAll35,
  GAll36,
  GAll37,
  GAll38,
  GAll39,
  GAll40,
  GAll41,
  GAll42,
  GAll43,
  GAll44,
  GAll45,
  GAll46,
];

const videos = [
  VELL1,
  VELL2,
  VELL3,
  VELL4,
  VELL5,
  VELL6,
  VELL7,
  VELL8,
  VELL9,
  VELL10,
  VELL11,
  VELL12,
];

// Keep the original gallery order: one video followed by up to three photos.
function buildGallery() {
  const media = [];
  let pi = 0;
  let vi = 0;

  while (pi < photos.length || vi < videos.length) {
    if (vi < videos.length) {
      media.push({ type: "video", src: videos[vi] });
      vi += 1;
    }
    for (let index = 0; index < 3 && pi < photos.length; index += 1) {
      media.push({ type: "photo", src: photos[pi] });
      pi += 1;
    }
  }

  return media.map((item, index) => ({
    ...item,
    id: `ink-gallery-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    label: item.type === "video" ? "VIDEO" : "PHOTO",
    alt:
      item.type === "video"
        ? `Ink Convention gallery video ${index + 1}`
        : `Tattoo artwork and culture photograph ${index + 1}`,
  }));
}

const galleryItems = buildGallery();

const filters = [
  { id: "all", label: "ALL", icon: null },
  { id: "photo", label: "PHOTOS", icon: Camera },
  { id: "video", label: "VIDEOS", icon: Film },
];

// Autoplay previews only when a video is on screen, so 12 videos do not all play at once.
function VideoPreview({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          const promise = video.play();
          if (promise && typeof promise.catch === "function")
            promise.catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px", threshold: 0.15 },
    );

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      className="inkGallery-cardMedia"
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

function EditorialPhotoCollage() {
  const collageRef = useRef(null);

  useEffect(() => {
    const collage = collageRef.current;
    if (!collage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frames = collage.querySelectorAll(".inkGallery-collageFrame");
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tween = gsap.fromTo(
        frames,
        { y: -95, opacity: 0, rotate: (i) => [-9, 9, -5][i] },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          ease: "back.out(1.15)",
          duration: 1.05,
          stagger: 0.17,
          delay: 0.22,
          clearProps: "transform,opacity",
        },
      );
      return () => tween.kill();
    });

    mm.add("(max-width: 767px)", () => {
      const tween = gsap.fromTo(
        frames,
        { y: -75, opacity: 0, rotate: (i) => [-8, 7, -6][i] },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          ease: "back.out(1.1)",
          duration: 0.85,
          stagger: 0.18,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: collage,
            start: "top 85%",
            once: true,
          },
        },
      );
      return () => tween.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      className="inkGallery-collage"
      ref={collageRef}
      aria-label="Three original gallery photographs"
    >
      <div className="inkGallery-collageStamp" aria-hidden="true">
        THE VISUAL ARCHIVE <span>— EST. IN INDIA</span>
      </div>

      <figure className="inkGallery-collageFrame inkGallery-collageFrame--back">
        <img src={GAll20} alt="Tattoo gallery artwork" />
        <figcaption>
          <span>01</span> / ART
        </figcaption>
      </figure>
      <figure className="inkGallery-collageFrame inkGallery-collageFrame--main">
        <img src={GAll44} alt="Ink Convention gallery portrait" />
        <figcaption>
          <span>02</span> / CULTURE
        </figcaption>
      </figure>
      <figure className="inkGallery-collageFrame inkGallery-collageFrame--front">
        <img src={GAll33} alt="Tattoo gallery detail" />
        <figcaption>
          <span>03</span> / INK
        </figcaption>
      </figure>

      <span className="inkGallery-collageFootnote">
        STORIES CAPTURED IN INK
      </span>
    </div>
  );
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  const filteredItems = useMemo(
    () =>
      activeFilter === "all"
        ? galleryItems
        : galleryItems.filter((item) => item.type === activeFilter),
    [activeFilter],
  );

  useEffect(() => {
    if (!selectedItem) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedItem]);

  return (
    <div className="gallery-container inkGallery">
      {/* HERO — all existing text and local gallery pictures are preserved */}
      <section className="inkGallery-hero" aria-labelledby="gallery-title">
        <div className="inkGallery-heroContent">
          <span className="inkGallery-eyebrow">
            <span className="inkGallery-eyebrowDot" /> INK CONVENTION GALLERY
          </span>
          <h1 id="gallery-title">
            ART.
            <br />
            <em>IN MOTION.</em>
          </h1>
          <p className="inkGallery-heroLead">
            Explore photos and videos from Ink Convention artists, tattoo work
            and moments from the community.
          </p>
          <p className="inkGallery-heroMicro">
            PHOTOS &bull; VIDEOS &bull; ARTISTS &bull; INK CONVENTION 2026
          </p>

         
          <p className="inkGallery-ctaDescription">
            Reserve your space at an upcoming Ink Convention expo and showcase
            your work to artists, clients and the tattoo community.
          </p>
        </div>
        <EditorialPhotoCollage />
      </section>

      {/* GALLERY FILTERS */}
      <section
        className="inkGallery-archive"
        aria-label="Tattoo gallery archive"
      >
        <div className="inkGallery-archiveIntro">
          <div>
            <span className="inkGallery-sectionKicker">
              THE COLLECTION / 2026
            </span>
            <h2>
              THE GALLERY<span className="inkGallery-sectionPeriod">.</span>
            </h2>
          </div>
          <p>
            Real photographs and videos from our existing gallery collection.
          </p>
        </div>

        <div
          className="inkGallery-filters"
          role="group"
          aria-label="Filter gallery media"
        >
          {filters.map(({ id, label, icon: Icon }) => {
            const count =
              id === "all"
                ? galleryItems.length
                : galleryItems.filter((item) => item.type === id).length;
            return (
              <button
                type="button"
                key={id}
                aria-pressed={activeFilter === id}
                className={`inkGallery-filter ${activeFilter === id ? "is-active" : ""}`}
                onClick={() => setActiveFilter(id)}
              >
                {Icon && <Icon size={16} strokeWidth={1.8} />}
                {label}
                <span>{String(count).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>

        <div className="inkGallery-toolbar">
          <span>
            {activeFilter === "all"
              ? "ALL MEDIA"
              : activeFilter === "photo"
                ? "PHOTOGRAPHS"
                : "VIDEO ARCHIVE"}
          </span>
          <span>{filteredItems.length} ITEMS</span>
        </div>

        <div className="inkGallery-grid">
          {filteredItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className="inkGallery-card"
              onClick={() => setSelectedItem(item)}
              aria-label={`Open ${item.label.toLowerCase()} ${item.number}`}
            >
              <span className="inkGallery-cardVisual">
                {item.type === "video" ? (
                  <VideoPreview src={item.src} />
                ) : (
                  <img
                    className="inkGallery-cardMedia"
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                  />
                )}
                <span className="inkGallery-cardType">
                  {item.type === "video" ? (
                    <Play size={12} fill="currentColor" />
                  ) : (
                    <Camera size={13} />
                  )}
                  {item.label}
                </span>
                <span className="inkGallery-cardView">
                  VIEW <ArrowUpRight size={15} />
                </span>
              </span>
              <span className="inkGallery-cardInfo">
                <span>
                  <strong>INK CONVENTION</strong>
                  <small>
                    {item.label} / {item.number}
                  </small>
                </span>
                <ArrowRight size={19} strokeWidth={1.6} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FULLSCREEN PHOTO / VIDEO VIEWER */}
      {selectedItem && (
        <div
          className="inkGallery-lightbox"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <div
            className="inkGallery-lightboxDialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedItem.label} preview`}
            ref={modalRef}
          >
            <header className="inkGallery-lightboxHeader">
              <span>
                INK CONVENTION <b>/</b> {selectedItem.label}{" "}
                {selectedItem.number}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close media preview"
              >
                <X size={22} />
              </button>
            </header>
            <div className="inkGallery-lightboxMedia">
              {selectedItem.type === "video" ? (
                <video
                  key={selectedItem.id}
                  src={selectedItem.src}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={selectedItem.src} alt={selectedItem.alt} />
              )}
            </div>
            <footer className="inkGallery-lightboxFooter">
              PHOTO / VIDEO ARCHIVE{" "}
              <span>
                {selectedItem.number} /{" "}
                {String(galleryItems.length).padStart(2, "0")}
              </span>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
