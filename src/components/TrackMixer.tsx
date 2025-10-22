'use client';

import { useState } from 'react';
import { Volume2, Drum, Guitar, Mic, Piano } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  volume: number;
  muted: boolean;
  color: string;
}

export default function TrackMixer() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'drums',
      name: '드럼',
      icon: <Drum className="w-4 h-4" />,
      volume: 75,
      muted: false,
      color: 'bg-red-500'
    },
    {
      id: 'bass',
      name: '베이스',
      icon: <Guitar className="w-4 h-4" />,
      volume: 60,
      muted: false,
      color: 'bg-blue-500'
    },
    {
      id: 'guitar',
      name: '기타',
      icon: <Guitar className="w-4 h-4" />,
      volume: 50,
      muted: false,
      color: 'bg-green-500'
    },
    {
      id: 'vocals',
      name: '보컬',
      icon: <Mic className="w-4 h-4" />,
      volume: 80,
      muted: false,
      color: 'bg-purple-500'
    },
    {
      id: 'other',
      name: '기타',
      icon: <Piano className="w-4 h-4" />,
      volume: 40,
      muted: false,
      color: 'bg-yellow-500'
    }
  ]);

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => 
      prev.map(track => 
        track.id === trackId ? { ...track, volume } : track
      )
    );
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => 
      prev.map(track => 
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  };

  const resetAllTracks = () => {
    setTracks(prev => 
      prev.map(track => ({ ...track, volume: 50, muted: false }))
    );
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-semibold">트랙 믹서</h2>
        </div>
        <button
          onClick={resetAllTracks}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
        >
          초기화
        </button>
      </div>

      <div className="space-y-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-zinc-700/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              {/* Track Icon and Name */}
              <div className="flex items-center gap-3 min-w-[100px]">
                <div className={`p-2 rounded-lg ${track.color} bg-opacity-20`}>
                  <div className={`${track.color.replace('bg-', 'text-')}`}>
                    {track.icon}
                  </div>
                </div>
                <span className="font-medium text-white">{track.name}</span>
              </div>

              {/* Volume Slider */}
              <div className="flex-1 flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.muted ? 0 : track.volume}
                  onChange={(e) => updateTrackVolume(track.id, Number(e.target.value))}
                  className="flex-1 h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
                  disabled={track.muted}
                />
                <span className="text-sm text-zinc-400 min-w-[40px] text-right">
                  {track.muted ? 'MUTE' : `${track.volume}%`}
                </span>
              </div>

              {/* Mute Button */}
              <button
                onClick={() => toggleTrackMute(track.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  track.muted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
                }`}
              >
                {track.muted ? '음소거 해제' : '음소거'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Master Volume */}
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="flex items-center gap-3 mb-3">
          <Volume2 className="w-5 h-5 text-red-500" />
          <span className="font-medium text-white">마스터 볼륨</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={75}
            className="flex-1 h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-zinc-400 min-w-[40px] text-right">75%</span>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 bg-zinc-700/30 rounded-lg">
        <p className="text-xs text-zinc-400">
          💡 참고: 현재는 시뮬레이션 모드입니다. 실제 악기 분리는 AI 기반 오디오 처리 기능이 필요합니다.
        </p>
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
        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }
        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}