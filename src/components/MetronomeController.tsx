'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause } from 'lucide-react';

interface MetronomeControllerProps {
  isPlaying: boolean;
}

export default function MetronomeController({ isPlaying }: MetronomeControllerProps) {
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(50);
  const [isMetronomeOn, setIsMetronomeOn] = useState(true); // 기본적으로 켜짐
  const [timeSignature, setTimeSignature] = useState('4/4');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = (accent: boolean = false) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = accent ? 1000 : 800;
    gainNode.gain.value = (volume / 100) * 0.3;

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.05);
  };

  useEffect(() => {
    if (isMetronomeOn && isPlaying) {
      const interval = 60000 / bpm;
      let beat = 0;
      const beatsPerBar = parseInt(timeSignature.split('/')[0]);

      intervalRef.current = setInterval(() => {
        playClick(beat === 0);
        beat = (beat + 1) % beatsPerBar;
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMetronomeOn, isPlaying, bpm, volume, timeSignature]);

  const toggleMetronome = () => {
    setIsMetronomeOn(!isMetronomeOn);
  };

  const commonBPMs = [60, 80, 100, 120, 140, 160, 180];
  const timeSignatures = ['2/4', '3/4', '4/4', '6/8'];

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">메트로놈</h2>
      </div>

      <div className="space-y-6">
        {/* Metronome Toggle */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleMetronome}
            disabled={!isPlaying}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isMetronomeOn
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
            } ${!isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMetronomeOn ? (
              <>
                <Pause className="w-4 h-4" />
                메트로놈 자동 실행 중
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                메트로놈 꺼짐
              </>
            )}
          </button>
        </div>
        
        <div className="text-center text-zinc-400 text-sm">
          {isPlaying ? (
            isMetronomeOn ? "음악과 함께 메트로놈이 자동으로 실행됩니다" : "메트로놈이 꺼져 있습니다"
          ) : (
            "음악을 재생하면 메트로놈이 자동으로 시작됩니다"
          )}
        </div>

        {/* BPM Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">속도 (BPM)</label>
            <span className="text-sm text-zinc-400">{bpm}</span>
          </div>
          
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
          />

          {/* Quick BPM Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {commonBPMs.map((tempo) => (
              <button
                key={tempo}
                onClick={() => setBpm(tempo)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  bpm === tempo
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
              >
                {tempo}
              </button>
            ))}
          </div>
        </div>

        {/* Time Signature */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">박자</label>
          <div className="grid grid-cols-4 gap-2">
            {timeSignatures.map((sig) => (
              <button
                key={sig}
                onClick={() => setTimeSignature(sig)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeSignature === sig
                    ? 'bg-red-500 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">메트로놈 볼륨</label>
            <span className="text-sm text-zinc-400">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>


      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}