import {
  Code,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Trophy,
  Gift,
  Sparkles,
} from "lucide-react";
import "../Style/About.css";

import ABOUT1 from "../assets/gall18.JPG";

const highlights = [
  { label: "Required Submission Format", value: "5 Images & 3 Videos" },
  { label: "Shortlisted by Expert Judges", value: "300 Finalists" },
  { label: "For the Ultimate Winners", value: "Top 3 Cash Prizes" },
  { label: "Featured for a Full Year", value: "Top 20 Hall of Fame" },
];

function About() {
  return (
    <div className="about-container w-full bg-[#08080a] text-white select-none overflow-x-hidden py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-28">
        {/* TOP SECTION: Hero About */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-1 lg:order-2 relative group overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#0b0b0f]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 via-transparent to-transparent group-hover:opacity-60 transition duration-700 z-10 pointer-events-none" />
            <img
              src={ABOUT1}
              alt="Tattoo Artist at Work"
              className="w-full h-[380px] sm:h-[480px] lg:h-[520px] object-cover transform group-hover:scale-105 transition duration-700 ease-out"
            />
          </div>

          <div className="order-2 lg:order-1 space-y-6">
            <h3 className="text-[#a855f7] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold">
              // ABOUT EXPO 2026 COMPETITION
            </h3>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
              THE ULTIMATE TATTOO ARTIST COMPETITION
            </h1>
            <p className="text-gray-400 text-base sm:text-lg font-light leading-relaxed max-w-xl">
              Built to discover, elevate, and reward the finest ink masters
              across the globe. Submit your best work and take your career to
              the next stage.
            </p>

            {/* Mini Trust Badges */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Layers size={16} />
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-300">
                  Pan India Submissions
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                  <Award size={16} />
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-300">
                  Expert Judging Panel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION: Competition Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-[#0b0b0f] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl">
          {highlights.map((item, idx) => (
            <div key={idx} className="space-y-2 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#a855f7]">
                {item.value}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-gray-400 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* CORE PRINCIPLES SECTION: Competition Steps */}
        <div className="pt-16 border-t border-white/10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              EVENT TIMELINE & ROADMAP
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <Code size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // PHASE 1: ONLINE ENTRIES (OPEN NOW - 10TH SEPTEMBER)
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                SUBMIT YOUR WORK
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                Upload 5 high-resolution images and 3 videos showcasing your
                best tattoo work, custom designs, and technique
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <Zap size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // PHASE 2: QUALIFICATION & RESULTS (11TH SEPTEMBER)
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                GET SHORTLISTED
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                Our judges will evaluate all submissions. The top 300 qualified
                artists will receive an official email confirmation and
                invitation to secure their spot for the live event.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // PHASE 3: THE MEGA EVENT & SEMINAR (FIRST WEEK OF OCTOBER)
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                CLAIM YOUR STAGE
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                The 300 finalists gat for a multi-day live exhibition and
                seminar. Network with industry legends, expand you brand, and
                connect with thousands of potential clients.
              </p>
            </div>
          </div>
        </div>

        {/* WHAT YOU CAN WIN SECTION: 3 Additional Cards */}
        <div className="pt-16 border-t border-white/10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              WHAT YOU CAN WIN
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Win Card 1 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <Trophy size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // TOP PRIZES
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Top 3 Overall Champions
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                Major Cash Prizes + Official Grand Champion Trophies presented
                live on the main stage.
              </p>
            </div>

            {/* Win Card 2 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <Sparkles size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // GLOBAL RECOGNITION
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Top 20 Finalists
              </h2>
              <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed">
                Dedicated profile feature in the EXPO 2026 Hall of Fame section
                for 1 full calendar year.
              </p>
            </div>

            {/* Win Card 3 */}
            <div className="glass-card p-8 rounded-3xl space-y-4 bg-[#0b0b0f] border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#a855f7]">
                <Gift size={24} />
              </div>
              <h4 className="text-xs font-mono text-[#a855f7] tracking-widest uppercase">
                // FINALIST PERKS
              </h4>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                All 300 Qualified Finalists
              </h2>
              <ul className="text-gray-400 text-sm sm:text-base font-light leading-relaxed space-y-2 list-disc pl-4">
                <li>
                  Official EXPO 2026 Qualification & Participation Certificate.
                </li>
                <li>Exclusive Artist Event Kit on arrival day.</li>
                <li>
                  Access to masterclass seminars led by world-class artists.
                </li>
                <li>
                  Direct exposure to thousands of attendees and future clients.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
