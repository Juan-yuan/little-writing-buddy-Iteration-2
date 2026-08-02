export type HttpErrorCode = 404 | 500 | 502

export type HttpErrorContent = {
  code: HttpErrorCode
  title: string
  summary: string
  detail: string
  securityNote: string
}
