import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/services/geminiVisionService', () => {
  class NotIdCardError extends Error {
    constructor() {
      super('Image is not an identity card');
      this.name = 'NotIdCardError';
    }
  }
  class GeminiConfigError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'GeminiConfigError';
    }
  }
  return {
    NotIdCardError,
    GeminiConfigError,
    parseIsoDate: (s?: string | null) => {
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    },
    recognizeIdCard: vi.fn(),
  };
});

vi.mock('../src/services/ocrSpaceService', () => ({
  isOcrSpaceConfigured: vi.fn(),
  ocrImage: vi.fn(),
}));

import { recognizeIdCard, NotIdCardError } from '../src/services/idRecognitionService';
import * as geminiVisionService from '../src/services/geminiVisionService';
import { isOcrSpaceConfigured, ocrImage } from '../src/services/ocrSpaceService';

const geminiRecognize = vi.mocked(geminiVisionService.recognizeIdCard);
const isOcrConfigured = vi.mocked(isOcrSpaceConfigured);
const ocrImageMock = vi.mocked(ocrImage);

const geminiData = {
  id_number: '012345678901',
  full_name: 'NGUYEN VAN A',
  date_of_birth: '1990-01-01',
  sex: 'M',
  nationality: 'Việt Nam',
  home: '',
  address: '',
  issue_date: '',
  expiry_date: '',
};

describe('idRecognitionService', () => {
  const originalProvider = process.env.ID_RECOGNITION_PROVIDER;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.ID_RECOGNITION_PROVIDER;
    } else {
      process.env.ID_RECOGNITION_PROVIDER = originalProvider;
    }
  });

  it('hybrid mode falls back to Gemini when OCR.space text lacks required fields', async () => {
    process.env.ID_RECOGNITION_PROVIDER = 'hybrid';
    isOcrConfigured.mockReturnValue(true);
    ocrImageMock.mockResolvedValue({ text: '012345678901', processingMs: 5 });
    geminiRecognize.mockResolvedValue(geminiData);

    const result = await recognizeIdCard(Buffer.from('img'), 'front');

    expect(geminiRecognize).toHaveBeenCalledWith(expect.any(Buffer), 'front');
    expect(result).toEqual(geminiData);
  });

  it('hybrid mode passes NotIdCardError through without calling Gemini', async () => {
    process.env.ID_RECOGNITION_PROVIDER = 'hybrid';
    isOcrConfigured.mockReturnValue(true);
    ocrImageMock.mockResolvedValue({ text: 'not an identity card at all', processingMs: 5 });

    await expect(recognizeIdCard(Buffer.from('img'), 'front')).rejects.toBeInstanceOf(NotIdCardError);
    expect(geminiRecognize).not.toHaveBeenCalled();
  });

  it('ocrspace mode throws when OCR.space is not configured', async () => {
    process.env.ID_RECOGNITION_PROVIDER = 'ocrspace';
    isOcrConfigured.mockReturnValue(false);

    await expect(recognizeIdCard(Buffer.from('img'), 'front')).rejects.toThrow(
      'OCR_SPACE_API_KEY is not configured',
    );
  });

  it('gemini mode calls Gemini directly', async () => {
    process.env.ID_RECOGNITION_PROVIDER = 'gemini';
    geminiRecognize.mockResolvedValue(geminiData);

    const result = await recognizeIdCard(Buffer.from('img'), 'front');

    expect(geminiRecognize).toHaveBeenCalledTimes(1);
    expect(ocrImageMock).not.toHaveBeenCalled();
    expect(result).toEqual(geminiData);
  });
});
