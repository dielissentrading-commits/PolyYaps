import { useEffect, useRef } from 'react';
import type { Exercise } from '@/engine/exercises';
import './learning.css';

interface InputExerciseProps {
  exercise: Exercise;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  locked: boolean;
}

/** Production: read the Dutch, write the Portuguese. */
export function InputExercise({
  exercise,
  value,
  onChange,
  onSubmit,
  locked,
}: InputExerciseProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // A new prompt should be ready to type into straight away.
  useEffect(() => {
    if (!locked) inputRef.current?.focus();
  }, [exercise.id, locked]);

  return (
    <div className="learn-card">
      <p className="learn-card__label muted small">
        {exercise.type === 'sentence' ? 'Zeg dit in het Portugees' : 'Hoe zeg je dit?'}
      </p>
      <p className="learn-card__target learn-card__target--prompt" lang={exercise.promptLang}>
        {exercise.prompt}
      </p>

      <form
        className="answer-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!locked && value.trim()) onSubmit();
        }}
      >
        <input
          ref={inputRef}
          className="answer-input"
          type="text"
          lang="pt-PT"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={locked}
          placeholder="Typ je antwoord"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="Je antwoord in het Portugees"
        />
      </form>
    </div>
  );
}
