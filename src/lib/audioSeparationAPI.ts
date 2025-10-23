// 외부 오디오 분리 API 연동
export interface SeparationService {
  name: string;
  separateAudio(file: File): Promise<SeparatedTracks>;
  getPreview?: (file: File) => Promise<string>;
}

export interface SeparatedTracks {
  drums: string;     // URL 또는 Blob
  bass: string;      // URL 또는 Blob
  vocals: string;    // URL 또는 Blob
  guitar: string;    // URL 또는 Blob
  other: string;     // URL 또는 Blob
}

// Lalal.ai API 연동 예시
export class LalalAIService implements SeparationService {
  name = 'Lalal.ai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async separateAudio(file: File): Promise<SeparatedTracks> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('stem', 'drums_bass_vocals_other'); // 분리 옵션

    try {
      // 1. 업로드
      const uploadResponse = await fetch('https://api.lalal.ai/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      const taskId = uploadResult.id;

      // 2. 분리 처리
      const separateResponse = await fetch(`https://api.lalal.ai/separate/${taskId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const separateResult = await separateResponse.json();

      // 3. 결과 다운로드
      const tracks = await this.downloadTracks(separateResult.result);

      return tracks;
    } catch (error) {
      throw new Error(`Lalal.ai separation failed: ${error}`);
    }
  }

  private async downloadTracks(result: any): Promise<SeparatedTracks> {
    // 분리된 트랙 다운로드 로직
    return {
      drums: result.drums,
      bass: result.bass,
      vocals: result.vocals,
      guitar: result.other,
      other: result.other
    };
  }
}

// Melody.ml API 연동 예시
export class MelodyMLService implements SeparationService {
  name = 'Melody.ml';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async separateAudio(file: File): Promise<SeparatedTracks> {
    // Melody.ml API 연동 로직
    // 유사한 구조로 구현
    throw new Error('Not implemented yet');
  }
}

// 서비스 팩토리
export class SeparationServiceFactory {
  static createService(type: 'lalal' | 'melodyml', apiKey: string): SeparationService {
    switch (type) {
      case 'lalal':
        return new LalalAIService(apiKey);
      case 'melodyml':
        return new MelodyMLService(apiKey);
      default:
        throw new Error(`Unsupported service type: ${type}`);
    }
  }
}

// 사용 예시:
// const service = SeparationServiceFactory.createService('lalal', 'your-api-key');
// const tracks = await service.separateAudio(audioFile);