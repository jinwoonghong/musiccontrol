'use client';

import { useState, useRef } from 'react';
import { Upload, Music, Loader2, Download } from 'lucide-react';

interface AudioSeparatorProps {
  onAudioSeparated: (tracks: { [key: string]: string }) => void;
}

export default function AudioSeparator({ onAudioSeparated }: AudioSeparatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 실제 구현 시에는 아래 서비스들 중 하나를 연동
  const SEPARATION_SERVICES = {
    // 1. Lalal.ai (유료, 고품질)
    lalal: {
      name: 'Lalal.ai',
      quality: '매우 높음',
      cost: '유료',
      api: 'https://api.lalal.ai'
    },
    // 2. Spleeter (오픈소스, 자체 호스팅 필요)
    spleeter: {
      name: 'Spleeter',
      quality: '중간',
      cost: '무료 (자체 서버 필요)',
      api: 'self-hosted'
    },
    // 3. Demucs (Facebook Research, 오픈소스)
    demucs: {
      name: 'Demucs',
      quality: '높음',
      cost: '무료 (WebAssembly 가능)',
      api: 'wasm'
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // 실제 구현 시에는 여기서 API 호출
      await simulateAudioSeparation(file);
    } catch (error) {
      console.error('Audio separation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateAudioSeparation = async (file: File) => {
    // 시뮬레이션 - 실제로는 오디오 분리 API 호출
    const steps = [
      '오디오 파일 분석 중...',
      '드럼 트랙 분리 중...',
      '베이스 트랙 분리 중...',
      '보컬 트랙 분리 중...',
      '기타 트랙 분리 중...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // 분리된 트랙 시뮬레이션
    const separatedTracks = {
      drums: URL.createObjectURL(file), // 실제로는 분리된 오디오 파일
      bass: URL.createObjectURL(file),
      vocals: URL.createObjectURL(file),
      guitar: URL.createObjectURL(file),
      other: URL.createObjectURL(file)
    };

    onAudioSeparated(separatedTracks);
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">고급 오디오 분리</h2>
      </div>

      <div className="space-y-6">
        {/* 서비스 선택 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">분리 엔진 선택</label>
          <div className="grid gap-2">
            {Object.entries(SEPARATION_SERVICES).map(([key, service]) => (
              <div key={key} className="p-3 bg-zinc-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{service.name}</div>
                    <div className="text-xs text-zinc-400">
                      품질: {service.quality} | 비용: {service.cost}
                    </div>
                  </div>
                  <button
                    className="px-3 py-1 bg-zinc-600 hover:bg-zinc-500 rounded text-sm"
                    disabled={key !== 'demucs'} // 현재는 Demucs만 활성화
                  >
                    {key === 'demucs' ? '선택됨' : '준비 중'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 파일 업로드 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">오디오 파일 업로드</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full p-4 border-2 border-dashed border-zinc-600 rounded-lg hover:border-zinc-500 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">오디오 분리 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6" />
                <span className="text-sm">오디오 파일 선택 (MP3, WAV, M4A)</span>
              </div>
            )}
          </button>
        </div>

        {/* 진행률 */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>분리 진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 설명 */}
        <div className="p-3 bg-zinc-700/30 rounded-lg">
          <h4 className="font-medium text-white mb-2">🎯 실제 악기별 볼륨 조절을 위해:</h4>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• AI 오디오 소스 분리 기술 필요</li>
            <li>• Demucs (WebAssembly)로 브라우저에서 직접 처리 가능</li>
            <li>• Lalal.ai 등 외부 API 연동으로 고품질 분리</li>
            <li>• 분리된 트랙별로 독립적인 오디오 제어</li>
          </ul>
        </div>
      </div>
    </div>
  );
}