import { useMemo } from 'react'
import { site, worksheet as copy } from '../content/siteCopy'
import type { WorksheetCase } from '../types/practice'
import { buildWorksheetRows } from '../utils/worksheetRows'
import { WorksheetRow } from './WorksheetRow'

interface WorksheetPreviewProps {
  selectedLetters: string[]
  worksheetCase: WorksheetCase
}

function caseLabel(worksheetCase: WorksheetCase): string {
  if (worksheetCase === 'both') return 'Uppercase & lowercase'
  if (worksheetCase === 'uppercase') return 'Uppercase'
  return 'Lowercase'
}

export function WorksheetPreview({
  selectedLetters,
  worksheetCase,
}: WorksheetPreviewProps) {
  const rows = useMemo(
    () => buildWorksheetRows(selectedLetters, worksheetCase),
    [selectedLetters, worksheetCase],
  )

  if (rows.length === 0) {
    return (
      <div className="worksheet-preview worksheet-preview-empty">
        <p>{copy.emptyPreview}</p>
      </div>
    )
  }

  return (
    <div className="worksheet-preview-wrap">
      <div
        className="worksheet-preview worksheet-print-area"
        id="worksheet-print-area"
        aria-label="Worksheet preview"
      >
        <header className="worksheet-print-header">
          <div>
            <h3 className="worksheet-print-title">{site.name}</h3>
            <p className="worksheet-print-subtitle">{copy.previewSubtitle}</p>
          </div>
          <div className="worksheet-print-meta">
            <span>{copy.nameField}</span>
            <span>{copy.dateField}</span>
          </div>
        </header>

        <p className="worksheet-print-instructions">
          {copy.instructions(caseLabel(worksheetCase), selectedLetters.join(', '))}
        </p>

        <div className="worksheet-preview-body">
          {rows.map((row) => (
            <WorksheetRow key={row.key} row={row} />
          ))}
        </div>

        <footer className="worksheet-print-footer">{copy.footer}</footer>
      </div>
    </div>
  )
}
