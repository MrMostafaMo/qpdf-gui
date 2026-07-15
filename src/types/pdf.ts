export interface PdfInfo {
  file_path: string
  file_name: string
  file_size: number
  page_count: number
  is_encrypted: boolean
  title: string | null
  author: string | null
  creation_date: string | null
  creator: string | null
  producer: string | null
}
