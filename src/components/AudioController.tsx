'use client';

import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface AudioControllerProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
}

export default function AudioController({ audioUrl, isPlaying, onPlayPause }: AudioControllerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Extract YouTube video ID from URL
  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(audioUrl);

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const onReady = (event: any) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
  };

  const onStateChange = (event: any) => {
    const playerState = event.data;
    if (playerState === 1) { // Playing
      onPlayPause(true);
    } else if (playerState === 2) { // Paused
      onPlayPause(false);
    }
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
  };

  const handleRestart = () => {
    if (player) {
      player.seekTo(0, true);
    }
  };

  // Update progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player && isPlaying) {
      interval = setInterval(() => {
        const currentTime = player.getCurrentTime();
        const videoDuration = player.getDuration();
        setProgress((currentTime / videoDuration) * 100);
        setDuration(videoDuration);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoId) {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
        <div className="text-center text-zinc-400">
          유효하지 않은 YouTube 링크입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">오디오 제어</h2>
      </div>

      {/* Hidden YouTube Player */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="hidden"
      />

      {/* Main Controls */}
      <div className="space-y-6">
        {/* Play Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">볼륨</label>
            <span className="text-sm text-zinc-400">{volume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
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