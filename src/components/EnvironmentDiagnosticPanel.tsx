
import { useEnvironmentStore, type AtmosphereMode } from '../store/useEnvironmentStore';
import { Activity, Sun, Volume2, Settings2 } from 'lucide-react';

export default function EnvironmentDiagnosticPanel() {
  const { noiseLevel, lightLevel, atmosphereMode, overrideMode, setOverrideMode } = useEnvironmentStore();

  const modes: AtmosphereMode[] = ['morning-zen', 'evening-chill', 'night-focus', 'busy-cafe', 'normal'];

  return (
    <div className="bg-[#111] rounded-2xl border border-white/10 p-6 shadow-2xl mb-12">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Activity className="w-5 h-5 text-luxury-matcha" />
        <h2 className="text-xl font-serif text-white tracking-widest uppercase">Sensor Diagnostics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Live Values */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] text-white/50 tracking-[0.2em] uppercase mb-2">
              <span className="flex items-center gap-2"><Sun className="w-3 h-3" /> Ambient Light</span>
              <span>{lightLevel}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500/80 rounded-full transition-all duration-1000"
                style={{ width: `${lightLevel}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-white/50 tracking-[0.2em] uppercase mb-2">
              <span className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> Noise Level</span>
              <span>{noiseLevel}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500/80 rounded-full transition-all duration-1000"
                style={{ width: `${noiseLevel}%` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[9px] text-white/40 tracking-[0.3em] uppercase mb-1">Current Active Mode</div>
            <div className="text-2xl font-serif text-luxury-matcha capitalize">{atmosphereMode.replace('-', ' ')}</div>
          </div>
        </div>

        {/* Override Controls */}
        <div className="bg-black/40 rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-white/50 tracking-[0.2em] uppercase mb-4">
            <Settings2 className="w-3 h-3" /> Manual Override
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setOverrideMode(null)}
              className={`px-3 py-1.5 rounded-lg text-[9px] tracking-widest uppercase transition-colors ${
                overrideMode === null 
                  ? 'bg-luxury-matcha text-white' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              Auto (Sensors)
            </button>
            {modes.map(mode => (
              <button
                key={mode}
                onClick={() => setOverrideMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[9px] tracking-widest uppercase transition-colors ${
                  overrideMode === mode 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-transparent text-white/40 border border-white/10 hover:bg-white/5'
                }`}
              >
                {mode.replace('-', ' ')}
              </button>
            ))}
          </div>
          <p className="text-[8px] text-white/30 tracking-widest mt-4 leading-relaxed">
            * Override mode forces the entire UI to adopt the selected atmosphere theme for testing purposes. Select "Auto" to return to live sensor data.
          </p>
        </div>
      </div>
    </div>
  );
}
