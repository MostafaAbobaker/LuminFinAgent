export interface AskResponse {
  answer: string
  sources: Source[]
  sub_queries: string[]
  kind: string
  invalid_citations: any[]
  unverified_numbers: any[]
  thinking: any
  timings: Timings
  cached: boolean
}

interface Source {
  label: string
  document: string
  file: string
  page: number
  pdf_page: number
  citation: string
}

interface Timings {
  plan: number
  retrieve: number
  rerank: number
  generate: number
  total: number
}
