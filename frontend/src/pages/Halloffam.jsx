import { Trophy } from "lucide-react";

export default function HallOfFame() {
  return (
    <div className="w-full min-h-screen bg-[#08080a] text-white select-none pt-32 pb-24 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-[1700px] mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest">
            <Trophy size={14} /> OFFICIAL PLATFORM RECORDS
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase">
            HALL OF FAME
          </h1>
          <p className="text-gray-400 text-sm sm:text-base font-light leading-relaxed max-w-2xl">
            Celebrating the artists who have achieved exceptional recognition
            through Ink Convention champions, category winners, and special
            award recipients.
          </p>
        </div>

        {/* Empty State / Coming Soon Banner */}
        <div className="max-w-4xl mx-auto bg-[#0b0b0f] border border-white/10 rounded-3xl p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-[#a855f7]/10 blur-[60px] rounded-full"></div>

          <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] mx-auto">
            <Trophy size={32} />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            THE INK CONVENTION HALL OF FAME BEGINS WITH OUR FIRST CHAMPIONS.
          </h3>

          <p className="text-gray-400 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Our first official inductees will be announced after the 2026
            championship. Hall of Fame status is reserved exclusively for
            overall champions, category winners, and special award recipients.
          </p>

          <div className="pt-4">
            <span className="inline-block px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 uppercase tracking-widest">
              SEASON 2026 • IN JUDGING PHASE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
