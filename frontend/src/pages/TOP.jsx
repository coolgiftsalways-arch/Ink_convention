import { Link } from "react-router-dom";
import { ArrowRight, Trophy, CheckCircle, Calendar, Award } from "lucide-react";

function TOP() {
  return (
    <div
      id="TOP"
      className="w-full min-h-screen bg-[#08080a] text-white font-sans pt-32 pb-24 px-4 sm:px-6 lg:px-12"
    >
      <div className="max-w-[1600px] mx-auto space-y-16">
        {/* TOP FEATURED BANNER CONTAINER */}
        <div className="relative w-full bg-gradient-to-r from-purple-950/70 via-[#111116] to-[#111116] border border-purple-500/30 rounded-3xl p-8 sm:p-10 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Background Glow Effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Text Content Area */}
          <div className="space-y-4 max-w-3xl relative z-10">
            {/* Eyebrow Text */}
            <span className="text-[11px] font-medium text-purple-400 tracking-[0.25em] uppercase block">
              // SUPREME GLOBAL RECOGNITION 2026
            </span>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              TATTOO STUDIO OF THE YEAR &amp; MASTER ARTIST SPOTLIGHT
            </h1>

            {/* Description Paragraph */}
            <p className="text-gray-300 text-sm md:text-base font-normal leading-relaxed max-w-2xl">
              Recognized worldwide for pushing the boundaries of custom tattoo
              work, hyper-realism, precision linework, and artistic innovation.
            </p>
          </div>

          {/* Clickable Action Button / Link */}
          <Link
            to="/Upload"
            className="group relative z-10 flex items-center gap-3 px-6 py-4 sm:px-8 sm:py-5 rounded-2xl sm:rounded-3xl bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] hover:bg-[#a855f7] hover:text-white hover:border-[#a855f7] transition-all duration-300 shadow-lg shadow-purple-950/40 backdrop-blur-sm flex-shrink-0 cursor-pointer"
          >
            <span className="text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold">
              CLICK HERE TO PARTICIPATE FOR EXPO 2026
            </span>
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </div>

        {/* SECTION BODY COPY CONTAINER */}
        <div className="bg-[#0b0b0f] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-12 shadow-2xl relative overflow-hidden">
          {/* Intro Heading & Description */}
          <div className="max-w-3xl space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              WILL YOUR ARTWORK BE FEATURED IN THE 2026 HALL OF FAME?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed">
              Every year, EXPO celebrates the most visionary ink masters across
              the globe. The Hall of Fame 2026 is reserved for the top artists
              who push the boundaries of craftsmanship, technique, and creative
              design.
            </p>
          </div>

          {/* How to Qualify Grid */}
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-bold font-mono text-[#a855f7] uppercase tracking-wider flex items-center gap-2">
              <Calendar size={20} /> HOW TO QUALIFY FOR EXPO 2026:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-purple-500/50 transition-colors duration-300">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block font-semibold">
                  // Step 1
                </span>
                <h4 className="text-base font-bold text-white">
                  Upload Your Work (Deadline: 10th September)
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Submit 5 high-resolution images and 3 videos of your best
                  tattoo work and custom art pieces.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-purple-500/50 transition-colors duration-300">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block font-semibold">
                  // Step 2
                </span>
                <h4 className="text-base font-bold text-white">
                  Jury Selection (11th September Notification)
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Our panel of international judges will evaluate all
                  submissions and shortlist the Top 100 Qualified Finalists.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-purple-500/50 transition-colors duration-300">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block font-semibold">
                  // Step 3
                </span>
                <h4 className="text-base font-bold text-white">
                  The October Live Mega Event &amp; Seminar
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  All finalists will receive an official invitation to attend
                  our exclusive multi-day live convention and masterclass
                  seminar in October.
                </p>
              </div>
            </div>
          </div>

          {/* What You Can Win Grid */}
          <div className="space-y-6 pt-4 border-t border-white/10">
            <h3 className="text-lg sm:text-xl font-bold font-mono text-[#a855f7] uppercase tracking-wider flex items-center gap-2">
              <Trophy size={20} /> WHAT YOU CAN WIN:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prize 1 */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Trophy size={20} />
                </div>
                <h4 className="text-base font-bold text-white">
                  Top 4 Overall Champions
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Major Cash Prizes + Grand Champion Trophies awarded on the
                  main stage.
                </p>
              </div>

              {/* Prize 2 */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Award size={20} />
                </div>
                <h4 className="text-base font-bold text-white">
                  Top 20 Finalists
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Earn a permanent 1-Year Spotlight in the official EXPO 2026
                  Hall of Fame.
                </p>
              </div>

              {/* Prize 3 */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <CheckCircle size={20} />
                </div>
                <h4 className="text-base font-bold text-white">
                  All 300 Finalists
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Receive an official Certificate of Qualification, an exclusive
                  Artist Kit, and direct networking access to thousands of
                  prospective future clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TOP;
