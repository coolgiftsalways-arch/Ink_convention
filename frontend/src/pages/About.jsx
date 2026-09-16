import React from "react";
import { Link } from "react-router-dom";

import {
  Globe,
  Award,
  Target,
  Scale,
  Trophy,
  Medal,
  PenTool,
  Star,
  Search,
  TrendingUp,
  Users,
  Briefcase,
  Heart,
  Building2,
  ChevronDown,
  ShieldCheck,
  ArrowUpRight,
  Play,
} from "lucide-react";

import "../Style/About.css";

/* =========================================================
   ABOUT IMAGES
========================================================= */

import heroImage from "../assets/about-ecosystem-bg.png";

import missionImage from "../assets/purple_noir_tattoo_studio.png";

import toolsImage from "../assets/neon_lit_tattoo_artist_workstation.png";

import artistImage from "../assets/purple_backstage_tattoo_portrait.png";

import expoImage from "../assets/neon_tattoo_expo_after_dark.png";

/* =========================================================
   ABOUT
========================================================= */

function About() {
  const beliefCards = [
    {
      icon: PenTool,
      title: "ART FIRST",
      desc: "The quality, creativity and execution of the tattoo should remain at the centre of the competition.",
    },

    {
      icon: Scale,
      title: "FAIR COMPETITION",
      desc: "Artists should understand how their work is evaluated and what standards they are competing against.",
    },

    {
      icon: Medal,
      title: "RECOGNITION MATTERS",
      desc: "Awards, rankings and documented achievements can help artists build long-term professional credibility.",
    },

    {
      icon: Search,
      title: "TALENT SHOULD BE DISCOVERABLE",
      desc: "Great artists should be easier to discover regardless of their location, follower count or studio size.",
    },
  ];

  const journey = [
    {
      step: "COMPETITION",
      desc: "Artists submit their work.",
    },

    {
      step: "JUDGING",
      desc: "Entries evaluated by criteria.",
    },

    {
      step: "RESULTS",
      desc: "Finalists & winners recognised.",
    },

    {
      step: "RANKING",
      desc: "Results build artist rankings.",
    },

    {
      step: "DISCOVERY",
      desc: "Artists build profiles.",
    },

    {
      step: "NEXT COMPETITION",
      desc: "Artists return to compete.",
    },
  ];

  const ecosystemCards = [
    {
      icon: PenTool,
      title: "ARTISTS",
      desc: "Compete, build profiles and earn recognition.",
    },

    {
      icon: ShieldCheck,
      title: "JUDGES",
      desc: "Provide professional evaluation and industry credibility.",
    },

    {
      icon: Users,
      title: "AUDIENCE",
      desc: "Discover artists, follow competitions and participate in People’s Choice activities where applicable.",
    },

    {
      icon: Briefcase,
      title: "BRANDS",
      desc: "Connect with the tattoo-art community through partnerships and sponsorship opportunities.",
    },
  ];

  const audienceCards = [
    {
      icon: PenTool,
      title: "TATTOO ARTISTS",
      desc: "For artists who want to compete, build recognition and showcase their work.",
    },

    {
      icon: Building2,
      title: "STUDIOS",
      desc: "For studios looking to highlight their artists and achievements.",
    },

    {
      icon: Heart,
      title: "TATTOO ENTHUSIASTS",
      desc: "For people who want to discover exceptional tattoo work and artists.",
    },

    {
      icon: Briefcase,
      title: "INDUSTRY BRANDS",
      desc: "For companies looking to connect with tattoo professionals and the wider tattoo community.",
    },
  ];

  return (
    <div className="about-container w-full bg-[#08080a] text-white select-none overflow-x-hidden font-sans">
      {/* =====================================================
          1. HERO
      ====================================================== */}

      <section className="w-full pt-28 pb-16 px-6 sm:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          {/* LEFT */}

          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-7 lg:space-y-8">
            <div>
              <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#a855f7]" />
                ABOUT INK CONVENTION
              </h4>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white uppercase">
              REDEFINING HOW TATTOO ARTISTS COMPETE, GET RECOGNISED & GET
              DISCOVERED
            </h1>

            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed max-w-xl">
              Ink Convention is a digital-first tattoo competition and
              artist-ranking platform created to give tattoo artists a
              professional space to showcase their work, compete across
              specialist categories, earn recognition and build a lasting
              reputation beyond social-media likes and follower counts.
            </p>

            {/* CLAIMS */}

            <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Globe size={18} />
                </div>

                <span className="text-xs font-mono text-gray-300 tracking-wider">
                  ONLINE-FIRST PLATFORM
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Award size={18} />
                </div>

                <span className="text-xs font-mono text-gray-300 tracking-wider">
                  PROFESSIONAL COMPETITION SYSTEM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 pt-2">
              <Link
                to="/competition"
                className="inline-flex items-center gap-4 text-[10px] font-mono tracking-[0.2em] uppercase"
              >
                <span className="w-12 h-12 rounded-full border border-[#a855f7] flex items-center justify-center text-[#a855f7]">
                  <ArrowUpRight size={17} />
                </span>
                Explore Competition
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}

          <div className="about-hero-image order-1 lg:order-2 relative group overflow-hidden border border-white/10 shadow-2xl bg-[#0b0b0f] min-h-[420px] lg:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 z-10 pointer-events-none" />

            <img
              src={heroImage}
              alt="Tattoo artist working inside studio"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute right-5 top-5 z-20 flex flex-col text-[8px] font-mono tracking-[0.25em] text-white/40 uppercase">
              <span>ART</span>
              <span>PEOPLE</span>
              <span>CULTURE</span>
              <span>STORIES</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. COMPETE / JUDGE / RANK / RECOGNISE
      ====================================================== */}

      <section className="relative z-20 w-full bg-[#050507] border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Target className="text-[#a855f7]" size={28} />

            <h3 className="text-xl font-bold tracking-tight uppercase">
              COMPETE
            </h3>

            <p className="text-sm font-light text-gray-400">
              Enter specialist tattoo categories.
            </p>
          </div>

          <div className="space-y-3">
            <Scale className="text-[#a855f7]" size={28} />

            <h3 className="text-xl font-bold tracking-tight uppercase">
              GET JUDGED
            </h3>

            <p className="text-sm font-light text-gray-400">
              Have your work evaluated using published criteria.
            </p>
          </div>

          <div className="space-y-3">
            <TrendingUp className="text-[#a855f7]" size={28} />

            <h3 className="text-xl font-bold tracking-tight uppercase">
              GET RANKED
            </h3>

            <p className="text-sm font-light text-gray-400">
              Build your Ink Convention standing through eligible competition
              results.
            </p>
          </div>

          <div className="space-y-3">
            <Trophy className="text-[#a855f7]" size={28} />

            <h3 className="text-xl font-bold tracking-tight uppercase">
              GET RECOGNISED
            </h3>

            <p className="text-sm font-light text-gray-400">
              Earn awards, recognition and professional exposure.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. WHY WE EXIST + OUR MISSION
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* WHY */}

          <div className="space-y-6">
            <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase font-semibold">
              // WHY INK CONVENTION EXISTS
            </h4>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
              GREAT TATTOO ART DESERVES MORE THAN A LIKE.
            </h2>

            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
              Social media can give artists visibility, but visibility does not
              always equal recognition. A tattoo may receive thousands of views
              without being evaluated for its technical execution, composition,
              originality or artistic quality.
            </p>

            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
              Ink Convention was created to build a more meaningful system — one
              where tattoo artists can submit their work, compete within defined
              categories, be evaluated by experienced professionals and build a
              measurable record of achievement.
            </p>

            {/* IMAGE 2 */}

            <div className="relative mt-10 h-[380px] overflow-hidden border border-white/10">
              <img
                src={missionImage}
                alt="Tattoo artist working close-up"
                className="w-full h-full object-cover grayscale-[30%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          </div>

          {/* MISSION */}

          <div className="space-y-7 bg-[#0b0b0f] p-8 sm:p-12 border border-white/5 shadow-2xl">
            <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase font-semibold">
              // OUR MISSION
            </h4>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
              BUILD A PLATFORM WHERE TALENT CAN BE MEASURED, RECOGNISED &
              REMEMBERED.
            </h2>

            <p className="text-gray-400 text-base font-light leading-relaxed">
              Our mission is to create a credible and accessible competition
              platform for tattoo artists while building a long-term ecosystem
              around artist recognition, rankings, discovery and creative
              excellence. We want the quality of an artist’s work to matter —
              not simply the size of their audience.
            </p>

            {/* IMAGE 3 */}

            <div className="relative h-[280px] overflow-hidden border border-white/10">
              <img
                src={toolsImage}
                alt="Tattoo machine and equipment"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4. WHAT WE BELIEVE
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              WHAT WE BELIEVE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beliefCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="glass-card bg-[#0b0b0f] border border-white/5 p-8 space-y-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2 uppercase">
                      {card.title}
                    </h3>

                    <p className="text-sm text-gray-400 leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          5. MORE THAN A ONE-TIME CONTEST
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
          {/* IMAGE 4 */}

          <div className="relative min-h-[600px] overflow-hidden border border-white/10">
            <img
              src={artistImage}
              alt="Tattoo artist backstage"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

            <div className="absolute left-7 bottom-7 z-10">
              <span className="text-[#a855f7] font-mono text-[10px] tracking-[0.3em]">
                THE JOURNEY
              </span>
            </div>
          </div>

          {/* CONTENT */}

          <div className="space-y-12">
            <div className="space-y-5">
              <h4 className="text-[#a855f7] font-mono text-xs tracking-[0.3em] uppercase">
                // MORE THAN A CONTEST
              </h4>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                MORE THAN A ONE-TIME CONTEST.
              </h2>

              <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
                Ink Convention is designed to become an ongoing platform rather
                than a single competition that disappears after the winners are
                announced.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journey.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="min-h-[140px] border border-white/10 p-5 flex flex-col justify-between bg-white/[0.01]">
                    <span className="text-[9px] text-[#a855f7] font-mono">
                      0{index + 1}
                    </span>

                    <div>
                      <h3 className="text-xs font-bold text-[#a855f7] tracking-widest uppercase">
                        {item.step}
                      </h3>

                      <p className="mt-2 text-[10px] text-gray-500 font-mono">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          6. ECOSYSTEM
      ====================================================== */}

      <section className="relative w-full py-24 px-6 sm:px-10 lg:px-12 border-y border-white/5 overflow-hidden bg-[#07070a]">
        {/* IMAGE 5 BACKGROUND */}

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={expoImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/95 via-[#050507]/80 to-[#050507]/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#08080a]/60 via-transparent to-[#08080a]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* LEFT */}

          <div className="space-y-6 max-w-xl">
            <p className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // THE INK CONVENTION ECOSYSTEM
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.04] uppercase">
              BUILDING AN ECOSYSTEM AROUND TATTOO ART
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light max-w-lg">
              Ink Convention brings artists, judges, audiences and industry
              brands into one connected platform built around tattoo culture,
              professional recognition and long-term creative growth.
            </p>

            <div className="w-20 h-[2px] bg-gradient-to-r from-[#a855f7] to-transparent" />
          </div>

          {/* CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ecosystemCards.map((block, index) => {
              const Icon = block.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden min-h-[175px] border border-white/10 bg-black/55 backdrop-blur-md p-6 space-y-4 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#a855f7]/50 hover:bg-black/70"
                >
                  <div className="relative z-10 w-11 h-11 border border-[#a855f7]/20 bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                    <Icon size={22} />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-sm font-black tracking-widest uppercase">
                      {block.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-[13px] text-gray-400 font-light leading-relaxed">
                      {block.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          7. COMPETITION STRUCTURE
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            COMPETITION WITH STRUCTURE, NOT JUST POPULARITY.
          </h2>

          <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
            Ink Convention is designed around defined categories, published
            rules and transparent judging criteria. Popularity can create
            attention, but it should not be the only measure of artistic
            quality. Our competition system is intended to give artists a
            structured environment in which technical ability, creativity,
            execution and artistic decisions can be evaluated.
          </p>
        </div>
      </section>

      {/* =====================================================
          8. WHO IS INK CONVENTION FOR
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
              WHO IS INK CONVENTION FOR?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audienceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={index}
                  className="glass-card bg-[#0b0b0f] border border-white/5 p-8 space-y-4 text-center"
                >
                  <Icon size={28} className="text-[#a855f7] mx-auto mb-2" />

                  <h3 className="text-base font-bold uppercase">
                    {card.title}
                  </h3>

                  <p className="text-sm text-gray-400 font-light leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          9. CREDIBILITY + LONG TERM VISION
      ====================================================== */}

      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* CREDIBILITY */}

          <div className="bg-[#0b0b0f] border border-white/10 p-10 sm:p-12 space-y-6">
            <ShieldCheck size={32} className="text-[#a855f7]" />

            <h3 className="text-2xl font-black uppercase tracking-tight">
              BUILT FOR CREDIBILITY
            </h3>

            <p className="text-gray-400 font-light leading-relaxed">
              Competition rules, submission requirements and judging methodology
              should be clearly communicated before artists enter. We believe
              participants should know what they are submitting, how their work
              will be evaluated and what recognition they are competing for.
            </p>

            <div className="pt-4">
              <Link
                to="/rules"
                className="text-xs font-mono tracking-widest text-[#a855f7] hover:text-white uppercase"
              >
                VIEW COMPETITION RULES ↗
              </Link>
            </div>
          </div>

          {/* VISION */}

          <div className="bg-gradient-to-br from-[#120a1f] to-[#0b0b0f] border border-[#a855f7]/20 p-10 sm:p-12 space-y-6 shadow-2xl shadow-purple-900/10">
            <Star size={32} className="text-[#a855f7]" />

            <h3 className="text-2xl font-black uppercase tracking-tight">
              FROM COMPETITION TO RECOGNITION.
            </h3>

            <p className="text-gray-300 font-light leading-relaxed">
              Our long-term vision is to build a trusted digital home for tattoo
              competitions, artist discovery and professional recognition. We
              want Ink Convention to become a platform where an artist can
              compete, build a track record, earn recognition and be discovered
              over time — rather than being defined by a single post, one
              contest or the number of followers they have.
            </p>

            <p className="text-[#a855f7] text-sm font-mono tracking-widest uppercase pt-2">
              The 2026 championship is the beginning of that journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
