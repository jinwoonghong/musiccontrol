'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, Drum, Guitar, Mic, Piano, Sliders, Zap } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;
  color: string;
  audioUrl?: string;
  audioElement?: HTMLAudioElement;
}

interface AdvancedTrackMixerProps {
  separatedTracks?: { [key: string]: string };
}

export default function AdvancedTrackMixer({ separatedTracks }: AdvancedTrackMixerProps) {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'drums',
      name: '드럼',
      icon: <Drum className="w-4 h-4" />,
      volume: 75,
      muted: false,
      solo: false,
      pan: 0,
      color: 'bg-red-500'
    },
    {
      id: 'bass',
      name: '베이스',
      icon: <Guitar className="w-4 h-4" />,
      volume: 60,
      muted: false,
      solo: false,
      pan: 0,
      color: 'bg-blue-500'
    },
    {
      id: 'vocals',
      name: '보컬',
      icon: <Mic className="w-4 h-4" />,
      volume: 80,
      muted: false,
      solo: false,
      pan: 0,
      color: 'bg-purple-500'
    },
    {
      id: 'guitar',
      name: '기타',
      icon: <Guitar className="w-4 h-4" />,
      volume: 50,
      muted: false,
      solo: false,
      pan: 0,
      color: 'bg-green-500'
    },
    {
      id: 'other',
      name: '기타',
      icon: <Piano className="w-4 h-4" />,
      volume: 40,
      muted: false,
      solo: false,
      pan: 0,
      color: 'bg-yellow-500'
    }
  ]);

  const [masterVolume, setMasterVolume] = useState(75);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 오디오 컨텍스트 초기화
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

  // 분리된 트랙 로드
  useEffect(() => {
    if (separatedTracks) {
      setTracks(prev => prev.map(track => ({
        ...track,
        audioUrl: separatedTracks[track.id]
      })));
    }
  }, [separatedTracks]);

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => 
      prev.map(track => {
        if (track.id === trackId) {
          const updatedTrack = { ...track, volume };
          if (track.audioElement) {
            track.audioElement.volume = (volume / 100) * (masterVolume / 100);
          }
          return updatedTrack;
        }
        return track;
      })
    );
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => 
      prev.map(track => {
        if (track.id === trackId) {
          const updatedTrack = { ...track, muted: !track.muted };
          if (track.audioElement) {
            track.audioElement.muted = !track.muted;
          }
          return updatedTrack;
        }
        return track;
      })
    );
  };

  const toggleTrackSolo = (trackId: string) => {
    setTracks(prev => {
      const newTracks = prev.map(track => ({
        ...track,
        solo: track.id === trackId ? !track.solo : false
      }));
      
      // Solo 로직: 다른 트랙 음소거
      const hasSolo = newTracks.some(track => track.solo);
      if (hasSolo) {
        return newTracks.map(track => ({
          ...track,
          muted: track.solo ? false : true
        }));
      }
      
      return newTracks;
    });
  };

  const updateTrackPan = (trackId: string, pan: number) => {
    setTracks(prev => 
      prev.map(track => 
        track.id === trackId ? { ...track, pan } : track
      )
    );
  };

  const resetAllTracks = () => {
    setTracks(prev => 
      prev.map(track => ({ 
        ...track, 
        volume: 50, 
        muted: false, 
        solo: false,
        pan: 0 
      }))
    );
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sliders className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-semibold">
            {separatedTracks ? '실시간 트랙 믹서' : '트랙 믹서 (시뮬레이션)'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isAdvancedMode
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            {isAdvancedMode ? '고급 모드' : '기본 모드'}
          </button>
          <button
            onClick={resetAllTracks}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
          >
            초기화
          </button>
        </div>
      </div>

      {separatedTracks && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-sm text-green-400">
            ✅ 실제 오디오 분리 완료! 각 트랙을 독립적으로 제어할 수 있습니다.
          </p>
        </div>
      )}

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
                {track.audioUrl && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="분리된 트랙" />
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-3">
                {/* Volume and Basic Controls */}
                <div className="flex items-center gap-3">
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

                {/* Advanced Controls */}
                {isAdvancedMode && (
                  <div className="flex items-center gap-3">
                    {/* Pan Control */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <span className="text-xs text-zinc-400">팬</span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={track.pan}
                        onChange={(e) => updateTrackPan(track.id, Number(e.target.value))}
                        className="w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-zinc-400 min-w-[30px]">
                        {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(track.pan)}` : `R${track.pan}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isAdvancedMode && (
                  <button
                    onClick={() => toggleTrackSolo(track.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      track.solo
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
                    }`}
                  >
                    SOLO
                  </button>
                )}
                <button
                  onClick={() => toggleTrackMute(track.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    track.muted
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-zinc-600 hover:bg-zinc-500 text-zinc-300'
                  }`}
                >
                  {track.muted ? '음소거 해제' : '음소거'}
                </button>
              </div>
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
            value={masterVolume}
            onChange={(e) => {
              const newVolume = Number(e.target.value);
              setMasterVolume(newVolume);
              // 모든 트랙의 볼륨 업데이트
              tracks.forEach(track => {
                if (track.audioElement) {
                  track.audioElement.volume = (track.volume / 100) * (newVolume / 100);
                }
              });
            }}
            className="flex-1 h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-zinc-400 min-w-[40px] text-right">{masterVolume}%</span>
        </div>
      </div>

      {/* Info */}
      {!separatedTracks && (
        <div className="mt-4 p-3 bg-zinc-700/30 rounded-lg">
          <p className="text-xs text-zinc-400">
            💡 현재는 시뮬레이션 모드입니다. 실제 악기 분리를 위해서는 오디오 분리 기능이 필요합니다.
          </p>
        </div>
      )}

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