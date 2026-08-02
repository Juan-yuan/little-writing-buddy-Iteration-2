import { jsPDF } from 'jspdf'
import { site, worksheetPdf as pdfCopy } from '../content/siteCopy'
import { getDisplayLetter } from '../data/letters'
import type { LetterCase, WorksheetCase } from '../types/practice'
import {
  buildWorksheetRows,
  TRACE_REPEAT_COUNT,
  type WorksheetRowData,
} from './worksheetRows'

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const CONTENT_W = PAGE_W - MARGIN * 2
const ROW_H = 19
const ROW_GAP = 2.5
const GUIDE_W = 16

const INK = { r: 30, g: 74, b: 95 } as const
const SKY = { r: 110, g: 181, b: 232 } as const
const MINT = { r: 126, g: 207, b: 142 } as const
const CORAL = { r: 240, g: 101, b: 74 } as const

function caseLabel(worksheetCase: WorksheetCase): string {
  if (worksheetCase === 'both') return 'Uppercase & lowercase'
  if (worksheetCase === 'uppercase') return 'Uppercase'
  return 'Lowercase'
}

function setPdfFont(doc: jsPDF, letterCase: LetterCase, size: number) {
  doc.setFontSize(size)
  if (letterCase === 'uppercase') {
    doc.setFont('helvetica', 'bold')
  } else {
    doc.setFont('times', 'italic')
  }
}

function drawRowLine(
  doc: jsPDF,
  x1: number,
  x2: number,
  y: number,
  color: { r: number; g: number; b: number },
  width: number,
  dashed: boolean,
) {
  doc.setDrawColor(color.r, color.g, color.b)
  doc.setLineWidth(width)
  if (dashed) {
    doc.setLineDashPattern([1.2, 1.2], 0)
  } else {
    doc.setLineDashPattern([], 0)
  }
  doc.line(x1, y, x2, y)
  doc.setLineDashPattern([], 0)
}

function drawWorksheetRow(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  row: WorksheetRowData,
) {
  const display = getDisplayLetter(row.baseLetter, row.letterCase)
  const traceX = x + GUIDE_W
  const traceW = width - GUIDE_W

  doc.setDrawColor(220, 220, 215)
  doc.setLineWidth(0.2)
  doc.rect(x, y, width, height)

  const topY = y + height * 0.18
  const midY = y + height * 0.42
  const baseY = y + height * 0.68
  const bottomY = y + height * 0.86

  drawRowLine(doc, traceX, x + width, topY, SKY, 0.35, false)
  drawRowLine(
    doc,
    traceX,
    x + width,
    midY,
    MINT,
    row.letterCase === 'uppercase' ? 0.2 : 0.3,
    true,
  )
  drawRowLine(doc, traceX, x + width, baseY, CORAL, 0.45, false)
  drawRowLine(
    doc,
    traceX,
    x + width,
    bottomY,
    SKY,
    row.letterCase === 'uppercase' ? 0.2 : 0.3,
    true,
  )

  const guideSize = row.letterCase === 'uppercase' ? 22 : 24
  setPdfFont(doc, row.letterCase, guideSize)
  doc.setTextColor(165, 180, 190)
  doc.text(display, x + GUIDE_W / 2, baseY, { align: 'center' })

  const traceSize = row.letterCase === 'uppercase' ? 15 : 16
  setPdfFont(doc, row.letterCase, traceSize)
  doc.setTextColor(210, 218, 222)

  const spacing = traceW / (TRACE_REPEAT_COUNT + 0.5)
  for (let i = 0; i < TRACE_REPEAT_COUNT; i++) {
    const letterX = traceX + spacing * (i + 0.75)
    doc.text(display, letterX, baseY, { align: 'center' })
  }

  doc.setTextColor(INK.r, INK.g, INK.b)
}

function drawPageHeader(
  doc: jsPDF,
  selectedLetters: string[],
  worksheetCase: WorksheetCase,
  compact = false,
) {
  const y = MARGIN

  if (!compact) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(INK.r, INK.g, INK.b)
    doc.text(site.name, MARGIN, y + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 120, 130)
    doc.text(pdfCopy.subtitle, MARGIN, y + 10)

    doc.setFontSize(9)
    doc.text(pdfCopy.nameField, PAGE_W - MARGIN, y + 5, {
      align: 'right',
    })
    doc.text(pdfCopy.dateField, PAGE_W - MARGIN, y + 10, {
      align: 'right',
    })

    doc.setFontSize(8)
    doc.text(
      pdfCopy.instructions(caseLabel(worksheetCase), selectedLetters.join(', ')),
      MARGIN,
      y + 16,
      { maxWidth: CONTENT_W },
    )

    doc.setDrawColor(220, 220, 215)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y + 19, PAGE_W - MARGIN, y + 19)

    return y + 24
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(INK.r, INK.g, INK.b)
  doc.text(site.name, MARGIN, y + 4)

  doc.setDrawColor(220, 220, 215)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y + 7, PAGE_W - MARGIN, y + 7)

  return y + 12
}

function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(140, 155, 165)
  doc.text(pdfCopy.footer, MARGIN, PAGE_H - 8)
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, {
    align: 'right',
  })
}

export function generateWorksheetPdf(
  selectedLetters: string[],
  worksheetCase: WorksheetCase,
): jsPDF {
  const rows = buildWorksheetRows(selectedLetters, worksheetCase)
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  let y = drawPageHeader(doc, selectedLetters, worksheetCase)
  const footerSpace = 12

  for (const row of rows) {
    if (y + ROW_H > PAGE_H - MARGIN - footerSpace) {
      doc.addPage()
      y = drawPageHeader(doc, selectedLetters, worksheetCase, true)
    }

    drawWorksheetRow(doc, MARGIN, y, CONTENT_W, ROW_H, row)
    y += ROW_H + ROW_GAP
  }

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)
    drawPageFooter(doc, page, totalPages)
  }

  return doc
}

export function downloadWorksheetPdf(
  selectedLetters: string[],
  worksheetCase: WorksheetCase,
): void {
  if (selectedLetters.length === 0) return

  const doc = generateWorksheetPdf(selectedLetters, worksheetCase)
  const slug = selectedLetters.slice(0, 6).join('-').toLowerCase()
  const suffix = selectedLetters.length > 6 ? `-plus${selectedLetters.length - 6}` : ''
  doc.save(`little-writing-buddy-worksheet-${slug}${suffix}.pdf`)
}
