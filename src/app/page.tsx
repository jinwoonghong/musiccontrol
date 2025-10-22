'use client';

import { useState } from 'react';
import { Music, Play, Pause, Volume2, Drum, Clock } from 'lucide-react';
import AudioController from '@/components/AudioController';
import MetronomeController from '@/components/MetronomeController';
import TrackMixer from '@/components/TrackMixer';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);

  const handleUrlSubmit = (url: string) => {
    setAudioUrl(url);
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Drum className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              DrumControl
            </h1>
          </div>
          <p className="text-zinc-400 text-lg">
            드러머를 위한 맞춤형 연습 보조 서비스
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {!showPlayer ? (
            /* URL Input Section */
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 border border-zinc-700">
              <div className="flex items-center gap-3 mb-6">
                <Music className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-semibold">음원 선택</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    YouTube Music 링크
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      placeholder="https://music.youtube.com/watch?v=..."
                      className="flex-1 px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-zinc-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value) {
                            handleUrlSubmit(target.value);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                        if (input?.value) {
                          handleUrlSubmit(input.value);
                        }
                      }}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      시작하기
                    </button>
                  </div>
                </div>
                
                <div className="text-center text-zinc-400 text-sm">
                  또는 로컬 음원 파일을 드래그하여 업로드하세요
                </div>
              </div>
            </div>
          ) : (
            /* Player Section */
            <div className="space-y-6">
              {/* Audio Controller */}
              <AudioController 
                audioUrl={audioUrl}
                isPlaying={isPlaying}
                onPlayPause={setIsPlaying}
              />

              {/* Track Mixer */}
              <TrackMixer />

              {/* Metronome */}
              <MetronomeController isPlaying={isPlaying} />

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowPlayer(false);
                  setAudioUrl('');
                  setIsPlaying(false);
                }}
                className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium transition-colors"
              >
                다른 음원 선택
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-zinc-500 text-sm">
          <p>© 2024 DrumControl - 드러머를 위한 최고의 연습 환경</p>
        </footer>
      </div>
    </div>
  );
}