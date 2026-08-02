import { alphabet, getDisplayLetter } from '../data/letters'
import { letters as copy } from '../content/siteCopy'
import type { LetterCase } from '../types/practice'

interface LetterControlsProps {
  letterCase: LetterCase
  selectedLetter: string
  onCaseChange: (letterCase: LetterCase) => void
  onLetterChange: (letter: string) => void
}

export function LetterControls({
  letterCase,
  selectedLetter,
  onCaseChange,
  onLetterChange,
}: LetterControlsProps) {
  const displayLetter = getDisplayLetter(selectedLetter, letterCase)

  return (
    <section className="panel letter-controls" aria-labelledby="letter-controls">
      <div className="letter-controls-toolbar">
        <div className="letter-controls-intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="letter-controls">{copy.title}</h2>
        </div>

        <div className="current-letter-badge" aria-live="polite">
          <span>{copy.nowTracing}</span>
          <span className="letter-display" aria-label={`Letter ${displayLetter}`}>
            {displayLetter}
          </span>
        </div>

        <div className="segmented-control" role="group" aria-label="Letter case">
          <button
            type="button"
            className={letterCase === 'uppercase' ? 'active' : ''}
            aria-pressed={letterCase === 'uppercase'}
            onClick={() => onCaseChange('uppercase')}
          >
            {copy.uppercase}
          </button>
          <button
            type="button"
            className={letterCase === 'lowercase' ? 'active' : ''}
            aria-pressed={letterCase === 'lowercase'}
            onClick={() => onCaseChange('lowercase')}
          >
            {copy.lowercase}
          </button>
        </div>
      </div>

      <div className="letter-grid" role="group" aria-label="Letters A to Z">
        {alphabet.map((letter) => {
          const isSelected = selectedLetter === letter
          const label = getDisplayLetter(letter, letterCase)

          return (
            <button
              type="button"
              key={letter}
              className={isSelected ? 'selected' : ''}
              aria-pressed={isSelected}
              aria-label={`Letter ${label}`}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => onLetterChange(letter)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
