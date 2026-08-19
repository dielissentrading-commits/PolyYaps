import { describe, expect, it } from 'vitest';
import { acceptableAnswers, checkAnswer, isCorrect } from '@/engine/answers';

describe('acceptableAnswers', () => {
  it('splits slash-separated alternatives from the content', () => {
    expect(acceptableAnswers('dag / vaarwel')).toEqual(['dag', 'vaarwel']);
    expect(acceptableAnswers('um / uma')).toEqual(['um', 'uma']);
  });

  it('keeps a single answer intact', () => {
    expect(acceptableAnswers('bom dia')).toEqual(['bom dia']);
  });
});

describe('checkAnswer', () => {
  it('accepts an exact answer', () => {
    expect(checkAnswer('obrigado', 'obrigado').verdict).toBe('correct');
  });

  it('ignores case, spacing and punctuation', () => {
    expect(checkAnswer('  Bom   Dia! ', 'bom dia').verdict).toBe('correct');
    expect(checkAnswer('Chamo me Duran', 'Chamo-me Duran.').verdict).toBe('correct');
  });

  it('accepts any listed alternative', () => {
    expect(checkAnswer('vaarwel', 'dag / vaarwel').verdict).toBe('correct');
    expect(checkAnswer('dag', 'dag / vaarwel').verdict).toBe('correct');
  });

  it('reports a missing accent as almost, not wrong', () => {
    const result = checkAnswer('nao', 'não');
    expect(result.verdict).toBe('almost');
    expect(result.matched).toBe('não');
    expect(result.hint).toBeTruthy();
  });

  it('treats an almost as knowing the item', () => {
    expect(isCorrect('almost')).toBe(true);
    expect(isCorrect('correct')).toBe(true);
    expect(isCorrect('incorrect')).toBe(false);
  });

  it('rejects a different word', () => {
    expect(checkAnswer('boa noite', 'bom dia').verdict).toBe('incorrect');
  });

  it('rejects an empty answer', () => {
    expect(checkAnswer('   ', 'bom dia').verdict).toBe('incorrect');
  });

  it('does not accept a prefix of the answer', () => {
    expect(checkAnswer('bom', 'bom dia').verdict).toBe('incorrect');
  });
});
