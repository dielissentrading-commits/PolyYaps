export type SpeechAssessment = {
  transcript: string;
  score: number;
  supported: boolean;
};

const recognitionTimeoutMs = 12_000;

export function normalizePortuguese(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speakPt(text: string, rate = 0.86) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-PT';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}

function levenshtein(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

export function similarityScore(expected: string, actual: string) {
  const left = normalizePortuguese(expected);
  const right = normalizePortuguese(actual);
  if (!left || !right) return 0;
  if (left === right) return 100;
  const maxLength = Math.max(left.length, right.length);
  const characterScore = Math.max(0, 1 - levenshtein(left, right) / maxLength);
  const expectedWords = new Set(left.split(' '));
  const actualWords = new Set(right.split(' '));
  const overlap = [...expectedWords].filter((word) => actualWords.has(word)).length;
  const wordScore = expectedWords.size ? overlap / expectedWords.size : 0;
  return Math.round((characterScore * 0.55 + wordScore * 0.45) * 100);
}

export function speechRecognitionAvailable() {
  if (typeof window === 'undefined') return false;
  const browserWindow = window as unknown as Record<string, unknown>;
  return Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition);
}

export function recognizePortugueseOnce(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Spraakherkenning is niet beschikbaar.'));
      return;
    }

    const browserWindow = window as unknown as Record<string, any>;
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      reject(new Error('Deze browser biedt geen ingebouwde spraakherkenning.'));
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'pt-PT';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finished = false;
    let heardResult = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const finish = (callback: () => void) => {
      if (finished) return;
      finished = true;
      if (timeoutId) clearTimeout(timeoutId);
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onnomatch = null;
      recognition.onend = null;
      callback();
    };

    recognition.onresult = (event: any) => {
      heardResult = true;
      const transcript = event?.results?.[0]?.[0]?.transcript ?? '';
      const value = String(transcript).trim();
      finish(() => value ? resolve(value) : reject(new Error('Ik kon geen duidelijke Portugese zin herkennen.')));
    };
    recognition.onerror = (event: any) => {
      finish(() => reject(new Error(event?.error ? `Microfoon: ${event.error}` : 'Spraakherkenning mislukt.')));
    };
    recognition.onnomatch = () => finish(() => reject(new Error('Ik kon geen duidelijke Portugese zin herkennen.')));
    recognition.onend = () => {
      if (!heardResult) finish(() => reject(new Error('De microfoon stopte zonder spraak te herkennen.')));
    };

    timeoutId = setTimeout(() => {
      try {
        recognition.abort();
      } catch {
        // Some WebKit versions throw when aborting an already-ended session.
      }
      finish(() => reject(new Error('De microfoon reageerde niet op tijd.')));
    }, recognitionTimeoutMs);

    try {
      recognition.start();
    } catch (reason) {
      finish(() => reject(reason instanceof Error ? reason : new Error('Spraakherkenning kon niet starten.')));
    }
  });
}

export async function assessSpokenPortuguese(expected: string): Promise<SpeechAssessment> {
  if (!speechRecognitionAvailable()) return { transcript: '', score: 0, supported: false };
  const transcript = await recognizePortugueseOnce();
  return { transcript, score: similarityScore(expected, transcript), supported: true };
}
