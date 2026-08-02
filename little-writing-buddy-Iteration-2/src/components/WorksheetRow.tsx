import { getDisplayLetter } from '../data/letters'
import { TRACE_REPEAT_COUNT, type WorksheetRowData } from '../utils/worksheetRows'

interface WorksheetRowProps {
  row: WorksheetRowData
}

export function WorksheetRow({ row }: WorksheetRowProps) {
  const display = getDisplayLetter(row.baseLetter, row.letterCase)

  return (
    <div className="worksheet-trace-row" data-case={row.letterCase}>
      <div className="worksheet-row-guidelines" aria-hidden="true">
        <span className="wg-line wg-top" title="Top line" />
        <span className="wg-line wg-mid" title="Midline" />
        <span className="wg-line wg-base" title="Baseline" />
        <span className="wg-line wg-bottom" title="Bottom line" />
      </div>

      <span
        className={`worksheet-row-guide worksheet-letter-${row.letterCase}`}
        aria-hidden="true"
      >
        {display}
      </span>

      <div className="worksheet-row-repeats" aria-hidden="true">
        {Array.from({ length: TRACE_REPEAT_COUNT }, (_, index) => (
          <span
            key={index}
            className={`worksheet-row-trace worksheet-letter-${row.letterCase}`}
          >
            {display}
          </span>
        ))}
      </div>
    </div>
  )
}
