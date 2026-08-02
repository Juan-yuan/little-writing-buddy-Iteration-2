import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TRACE_REPEAT_COUNT } from '../utils/worksheetRows'
import { WorksheetRow } from './WorksheetRow'

describe('feature: worksheet row', () => {
  it('correct: renders guide letter and repeat traces for uppercase', () => {
    const { container } = render(
      <WorksheetRow row={{ baseLetter: 'A', letterCase: 'uppercase', key: 'A-upper' }} />,
    )

    expect(container.querySelector('[data-case="uppercase"]')).toBeInTheDocument()
    expect(container.querySelectorAll('.worksheet-row-trace')).toHaveLength(TRACE_REPEAT_COUNT)
    expect(container.querySelector('.worksheet-row-guide')).toHaveTextContent('A')
  })

  it('wrong: lowercase rows do not show uppercase glyphs', () => {
    const { container } = render(
      <WorksheetRow row={{ baseLetter: 'B', letterCase: 'lowercase', key: 'B-lower' }} />,
    )

    expect(container.querySelector('[data-case="lowercase"]')).toBeInTheDocument()
    expect(container.querySelector('.worksheet-row-guide')).toHaveTextContent('b')
    expect(container.querySelector('.worksheet-row-guide')).not.toHaveTextContent('B')
  })
})
