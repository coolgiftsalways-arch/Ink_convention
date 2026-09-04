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
} from "lucide-react";
import "../Style/About.css";
import image from "../assets/gall18.JPG";

function About() {
  return (
    <div className="w-full bg-[#08080a] text-white select-none overflow-x-hidden font-sans">
      {/* =========================================
          1. HERO SECTION
      ========================================= */}
      <section className="w-full pt-28 pb-16 px-6 sm:px-10 lg:px-12">
        {/* FIXED: Changed to items-stretch to make image and text match heights */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          {/* Text Content */}
          {/* FIXED: Added flex flex-col justify-center to vertically center text */}
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-6 lg:space-y-8">
            <div className="overflow-hidden">
              <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#a855f7]"></span>
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

            {/* Strategic Claims */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Globe size={18} />
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-300 tracking-wider">
                  ONLINE-FIRST PLATFORM
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Award size={18} />
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-300 tracking-wider">
                  PROFESSIONAL COMPETITION SYSTEM
                </span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {/* FIXED: Changed fixed heights to dynamic stretch (absolute inset-0) */}
          <div className="order-1 lg:order-2 relative group overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#0b0b0f] min-h-[350px] lg:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 via-transparent to-transparent group-hover:opacity-60 transition duration-700 z-10 pointer-events-none" />
            <img
              src={image}
              alt="Professional Tattoo Artistry"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out"
            />
          </div>
        </div>
      </section>

      {/* =========================================
          2. STRATEGIC STATEMENT (Replacing Stats Bar)
      ========================================= */}
      <section className="relative z-20 w-full bg-[#050507] border-y border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Target className="text-[#a855f7]" size={28} />
            <h3 className="text-xl font-bold tracking-tight text-white uppercase">
              COMPETE
            </h3>
            <p className="text-sm font-light text-gray-400">
              Enter specialist tattoo categories.
            </p>
          </div>
          <div className="space-y-3">
            <Scale className="text-[#a855f7]" size={28} />
            <h3 className="text-xl font-bold tracking-tight text-white uppercase">
              GET JUDGED
            </h3>
            <p className="text-sm font-light text-gray-400">
              Have your work evaluated using published criteria.
            </p>
          </div>
          <div className="space-y-3">
            <TrendingUp className="text-[#a855f7]" size={28} />
            <h3 className="text-xl font-bold tracking-tight text-white uppercase">
              GET RANKED
            </h3>
            <p className="text-sm font-light text-gray-400">
              Build your Ink Convention standing through eligible competition
              results.
            </p>
          </div>
          <div className="space-y-3">
            <Trophy className="text-[#a855f7]" size={28} />
            <h3 className="text-xl font-bold tracking-tight text-white uppercase">
              GET RECOGNISED
            </h3>
            <p className="text-sm font-light text-gray-400">
              Earn awards, recognition and professional exposure.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          3. WHY WE EXIST & OUR MISSION
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Why We Exist */}
          <div className="space-y-6">
            <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // WHY INK CONVENTION EXISTS
            </h4>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white uppercase">
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
          </div>

          {/* Our Mission */}
          <div className="space-y-6 bg-[#0b0b0f] p-8 sm:p-12 rounded-3xl border border-white/5 shadow-2xl">
            <h4 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // OUR MISSION
            </h4>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white uppercase">
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
          </div>
        </div>
      </section>

      {/* =========================================
          4. WHAT WE BELIEVE
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              WHAT WE BELIEVE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#0b0b0f] border border-white/5 rounded-2xl p-8 space-y-6 hover:border-[#a855f7]/40 transition duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                  <card.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 uppercase">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          5. WHAT MAKES INK CONVENTION DIFFERENT?
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto space-y-16 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              MORE THAN A ONE-TIME CONTEST.
            </h2>
            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed">
              Ink Convention is designed to become an ongoing platform rather
              than a single competition that disappears after the winners are
              announced.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 lg:gap-4 max-w-5xl mx-auto">
            {[
              { step: "COMPETITION", desc: "Artists submit their work." },
              { step: "JUDGING", desc: "Entries evaluated by criteria." },
              { step: "RESULTS", desc: "Finalists & winners recognised." },
              { step: "RANKING", desc: "Results build artist rankings." },
              { step: "DISCOVERY", desc: "Artists build profiles." },
              { step: "NEXT COMPETITION", desc: "Artists return to compete." },
            ].map((item, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center space-y-3 p-4">
                  <div className="w-full max-w-[140px] h-[100px] bg-[#0b0b0f] border border-white/10 rounded-xl flex items-center justify-center p-3">
                    <span className="text-[11px] sm:text-xs font-bold text-[#a855f7] tracking-widest uppercase text-center">
                      {item.step}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono tracking-wider text-center">
                    {item.desc}
                  </p>
                </div>
                {i < 5 && (
                  <div className="text-gray-700 md:-rotate-90 md:mx-0 mx-auto py-2 md:py-0">
                    <ChevronDown size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          6. THE INK CONVENTION ECOSYSTEM
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#0b0b0f] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white uppercase">
              BUILDING AN ECOSYSTEM AROUND TATTOO ART
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
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
            ].map((block, i) => (
              <div
                key={i}
                className="bg-[#050507] p-6 rounded-2xl border border-white/5 space-y-4"
              >
                <block.icon size={24} className="text-[#a855f7]" />
                <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                  {block.title}
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {block.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          7. OUR APPROACH TO COMPETITION
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
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
          <div className="pt-4">
            <Link
              to="/rules"
              className="inline-flex items-center gap-3 bg-transparent border border-[#a855f7] hover:bg-[#a855f7] text-[#a855f7] hover:text-white px-8 py-4 rounded-xl font-bold text-xs font-mono uppercase tracking-widest transition duration-300"
            >
              SEE HOW JUDGING WORKS
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================
          8. WHO IS INK CONVENTION FOR?
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#050507] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              WHO IS INK CONVENTION FOR?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#0b0b0f] border border-white/5 rounded-2xl p-8 space-y-4 text-center"
              >
                <card.icon size={28} className="text-[#a855f7] mx-auto mb-2" />
                <h3 className="text-base font-bold text-white uppercase">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          9. BUILT FOR CREDIBILITY & 10. LONG-TERM VISION
      ========================================= */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-12 bg-[#08080a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Built for Credibility */}
          <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-10 sm:p-12 space-y-6">
            <ShieldCheck size={32} className="text-[#a855f7]" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
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
                className="text-xs font-mono tracking-widest text-[#a855f7] hover:text-white uppercase underline underline-offset-8 decoration-white/20"
              >
                VIEW COMPETITION RULES
              </Link>
            </div>
          </div>

          {/* Long-Term Vision */}
          <div className="bg-gradient-to-br from-[#120a1f] to-[#0b0b0f] border border-[#a855f7]/20 rounded-3xl p-10 sm:p-12 space-y-6 shadow-2xl shadow-purple-900/10">
            <Star size={32} className="text-[#a855f7]" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
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

      {/*
          FINAL CALL TO ACTION REMOVED
          "READY TO PUT YOUR WORK TO THE TEST?"
          can be restored here later if needed.
      */}
    </div>
  );
}

export default About;
