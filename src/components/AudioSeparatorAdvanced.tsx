'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Music, Loader2, Download, Zap, CheckCircle } from 'lucide-react';
import { DemucsSeparator, AudioProcessor, SeparatedAudio } from '@/lib/demucsWasm';

interface AudioSeparatorProps {
  onAudioSeparated: (tracks: { [key: string]: string }) => void;
}

export default function AudioSeparatorAdvanced({ onAudioSeparated }: AudioSeparatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const separatorRef = useRef<DemucsSeparator | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 모델 초기화
  const initializeModel = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (!separatorRef.current) {
      separatorRef.current = new DemucsSeparator(audioContextRef.current);
    }

    if (!isModelLoaded) {
      setStatus('AI 모델 로딩 중...');
      try {
        await separatorRef.current.loadModel();
        setModelInfo(separatorRef.current.getModelInfo());
        setIsModelLoaded(true);
        setStatus('모델 로딩 완료! 오디오 파일을 선택하세요.');
      } catch (error) {
        console.error('Model loading failed:', error);
        setStatus('모델 로딩 실패. 페이지를 새로고침해주세요.');
      }
    }
  }, [isModelLoaded]);

  // 컴포넌트 마운트 시 모델 초기화
  useState(() => {
    initializeModel();
  });

  const handleFileUpload = async (file: File) => {
    if (!isModelLoaded) {
      setStatus('모델이 아직 로딩 중입니다. 잠시만 기다려주세요...');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('오디오 파일 분석 중...');

    try {
      // 1. 파일을 AudioBuffer로 변환
      setProgress(20);
      setStatus('오디오 디코딩 중...');
      const audioBuffer = await AudioProcessor.fileToAudioBuffer(file, audioContextRef.current!);

      // 2. 오디오 분리 처리
      setProgress(40);
      setStatus('AI 오디오 분리 중...');
      const separated = await separatorRef.current!.separateAudio(audioBuffer);
      
      setProgress(70);
      setStatus('분리된 트랙 저장 중...');

      // 3. 분리된 오디오를 Blob으로 변환
      const trackUrls: { [key: string]: string } = {};
      
      for (const [instrument, buffer] of Object.entries(separated)) {
        const blob = AudioProcessor.audioBufferToBlob(buffer);
        trackUrls[instrument] = URL.createObjectURL(blob);
      }

      setProgress(90);
      setStatus('트랙 믹서 연동 중...');

      // 4. 부모 컴포넌트에 전달
      onAudioSeparated(trackUrls);
      
      setProgress(100);
      setStatus('오디오 분리 완료!');
      setProcessedFiles(prev => [...prev, file.name]);

      // 3초 후 상태 초기화
      setTimeout(() => {
        setStatus('');
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Audio separation failed:', error);
      setStatus(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 확인 (최대 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setStatus('파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }

      // 파일 형식 확인
      const supportedFormats = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
      if (!supportedFormats.includes(file.type)) {
        setStatus('지원하지 않는 파일 형식입니다. MP3, WAV, M4A, OGG 파일만 가능합니다.');
        return;
      }

      handleFileUpload(file);
    }
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-semibold">AI 오디오 분리</h2>
        {isModelLoaded && (
          <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              모델 준비됨
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* 모델 정보 */}
        {modelInfo && (
          <div className="p-4 bg-zinc-700/30 rounded-lg">
            <h3 className="font-medium text-white mb-2">🤖 AI 모델 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-zinc-400">모델:</div>
              <div className="text-white">{modelInfo.name}</div>
              <div className="text-zinc-400">품질:</div>
              <div className="text-white">{modelInfo.quality}</div>
              <div className="text-zinc-400">처리 시간:</div>
              <div className="text-white">{modelInfo.processingTime}</div>
              <div className="text-zinc-400">지원 형식:</div>
              <div className="text-white">{modelInfo.supportedFormats.join(', ')}</div>
            </div>
          </div>
        )}

        {/* 파일 업로드 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">오디오 파일 선택</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={isProcessing || !isModelLoaded}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || !isModelLoaded}
            className="w-full p-6 border-2 border-dashed border-zinc-600 rounded-lg hover:border-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <div className="text-center">
                  <div className="font-medium text-white">{status}</div>
                  <div className="text-sm text-zinc-400 mt-1">잠시만 기다려주세요...</div>
                </div>
              </div>
            ) : !isModelLoaded ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm">AI 모델 로딩 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">오디오 파일을 드래그하거나 클릭하세요</span>
                <span className="text-xs text-zinc-400">MP3, WAV, M4A, OGG (최대 50MB)</span>
              </div>
            )}
          </button>
        </div>

        {/* 진행률 */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">처리 진행률</span>
              <span className="text-zinc-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status && (
              <div className="text-sm text-zinc-400 text-center">{status}</div>
            )}
          </div>
        )}

        {/* 상태 메시지 */}
        {status && !isProcessing && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('오류') 
              ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}>
            {status}
          </div>
        )}

        {/* 처리된 파일 목록 */}
        {processedFiles.length > 0 && (
          <div className="p-3 bg-zinc-700/30 rounded-lg">
            <h4 className="font-medium text-white mb-2">처리된 파일:</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              {processedFiles.map((filename, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {filename}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 사용 가이드 */}
        <div className="p-4 bg-zinc-700/30 rounded-lg">
          <h4 className="font-medium text-white mb-2">🎵 사용 가이드</h4>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• WebAssembly 기반으로 브라우저에서 직접 처리</li>
            <li>• 외부 서버나 API 비용 없이 무료로 사용</li>
            <li>• 드럼, 베이스, 보컬, 기타 트랙으로 자동 분리</li>
            <li>• 분리된 트랙은 독립적으로 볼륨 조절 가능</li>
            <li>• 처리된 오디오는 브라우저 메모리에만 저장</li>
          </ul>
        </div>
      </div>
    </div>
  );
}