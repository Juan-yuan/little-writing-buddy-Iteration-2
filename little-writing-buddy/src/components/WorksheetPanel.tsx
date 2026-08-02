import { Download, Printer } from 'lucide-react'
import { worksheet as copy } from '../content/siteCopy'
import { alphabet } from '../data/letters'
import type { WorksheetCase } from '../types/practice'
import { buildWorksheetRows } from '../utils/worksheetRows'
import { WorksheetPreview } from './WorksheetPreview'

interface WorksheetPanelProps {
  selectedLetters: string[]
  worksheetCase: WorksheetCase
  onToggleLetter: (letter: string) => void
  onSelectAllLetters: () => void
  onClearLetters: () => void
  onCaseChange: (worksheetCase: WorksheetCase) => void
}

function handlePrint() {
  window.print()
}

export function WorksheetPanel({
  selectedLetters,
  worksheetCase,
  onToggleLetter,
  onSelectAllLetters,
  onClearLetters,
  onCaseChange,
}: WorksheetPanelProps) {
  const rowCount = buildWorksheetRows(selectedLetters, worksheetCase).length
  const hasSelection = selectedLetters.length > 0

  async function handleDownloadPdf() {
    const { downloadWorksheetPdf } = await import('../utils/worksheetPdf')
    downloadWorksheetPdf(selectedLetters, worksheetCase)
  }

  return (
    <section className="panel worksheet-panel" aria-labelledby="worksheet-title">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="worksheet-title">{copy.title}</h2>
      </div>

      <p className="panel-intro">{copy.intro}</p>

      <div className="worksheet-panel-body">
        <div className="worksheet-sidebar">
          <div className="worksheet-options">
            <div className="option-group">
              <div className="option-group-header">
                <label id="worksheet-letters-label">{copy.chooseLetters}</label>
                <div className="worksheet-quick-actions">
                  <button type="button" className="link-button" onClick={onSelectAllLetters}>
                    {copy.selectAll}
                  </button>
                  <button
                    type="button"
                    className="link-button"
                    onClick={onClearLetters}
                    disabled={!hasSelection}
                  >
                    {copy.clearAll}
                  </button>
                </div>
              </div>
              <div
                className="worksheet-letter-picker"
                role="group"
                aria-labelledby="worksheet-letters-label"
              >
                {alphabet.map((letter) => (
                  <button
                    type="button"
                    key={letter}
                    className={selectedLetters.includes(letter) ? 'selected' : ''}
                    aria-pressed={selectedLetters.includes(letter)}
                    aria-label={`Letter ${letter}`}
                    onClick={() => onToggleLetter(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label id="worksheet-case-label">{copy.letterStyle}</label>
              <div
                className="worksheet-case-toggle"
                role="group"
                aria-labelledby="worksheet-case-label"
              >
                {(['uppercase', 'lowercase', 'both'] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={worksheetCase === option ? 'active' : ''}
                    aria-pressed={worksheetCase === option}
                    onClick={() => onCaseChange(option)}
                  >
                    {option === 'uppercase' && copy.uppercase}
                    {option === 'lowercase' && copy.lowercase}
                    {option === 'both' && copy.both}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="worksheet-status" aria-live="polite">
            {hasSelection
              ? copy.lettersRows(selectedLetters.length, rowCount)
              : copy.selectLetters}
          </p>

          <div className="worksheet-actions">
            <button
              type="button"
              className="secondary-action"
              disabled={!hasSelection}
              onClick={handlePrint}
            >
              <Printer size={18} aria-hidden="true" />
              {copy.print}
            </button>
            <button
              type="button"
              className="primary-action"
              disabled={!hasSelection}
              onClick={handleDownloadPdf}
            >
              <Download size={18} aria-hidden="true" />
              {copy.downloadPdf}
            </button>
          </div>
        </div>

        <div className="worksheet-preview-column">
          <WorksheetPreview
            selectedLetters={selectedLetters}
            worksheetCase={worksheetCase}
          />
        </div>
      </div>
    </section>
  )
}
