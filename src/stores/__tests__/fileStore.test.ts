import { describe, it, expect, beforeEach } from "vitest"
import { useFileStore } from "../fileStore"
import type { PdfInfo } from "@/types"

const makeFile = (path: string, page_count = 1): PdfInfo => ({
  file_path: path,
  file_name: path.split("/").pop() ?? "test.pdf",
  file_size: 1024,
  page_count,
  is_encrypted: false,
  title: null,
  author: null,
  creation_date: null,
  creator: null,
  producer: null,
})

describe("fileStore", () => {
  beforeEach(() => {
    useFileStore.setState({
      currentFile: null,
      recentFiles: [],
      pendingFile: null,
    })
  })

  it("sets current file", () => {
    const file = makeFile("/tmp/test.pdf")
    useFileStore.getState().setCurrentFile(file)
    expect(useFileStore.getState().currentFile).toEqual(file)
  })

  it("adds recent file", () => {
    const file = makeFile("/tmp/test.pdf")
    useFileStore.getState().addRecentFile(file)
    expect(useFileStore.getState().recentFiles).toHaveLength(1)
    expect(useFileStore.getState().recentFiles[0].file_path).toBe("/tmp/test.pdf")
  })

  it("deduplicates by file_path", () => {
    const file = makeFile("/tmp/test.pdf")
    useFileStore.getState().addRecentFile(file)
    useFileStore.getState().addRecentFile({ ...file, page_count: 5 })
    expect(useFileStore.getState().recentFiles).toHaveLength(1)
    expect(useFileStore.getState().recentFiles[0].page_count).toBe(5)
  })

  it("respects max limit", () => {
    const store = useFileStore.getState()
    for (let i = 0; i < 25; i++) {
      store.addRecentFile(makeFile(`/tmp/${i}.pdf`), 10)
    }
    expect(useFileStore.getState().recentFiles).toHaveLength(10)
  })

  it("clears recent files", () => {
    useFileStore.getState().addRecentFile(makeFile("/tmp/test.pdf"))
    useFileStore.getState().clearRecentFiles()
    expect(useFileStore.getState().recentFiles).toHaveLength(0)
  })

  it("sets pending file", () => {
    useFileStore.getState().setPendingFile("/tmp/drop.pdf")
    expect(useFileStore.getState().pendingFile).toBe("/tmp/drop.pdf")
  })

  it("clears pending file", () => {
    useFileStore.getState().setPendingFile("/tmp/drop.pdf")
    useFileStore.getState().setPendingFile(null)
    expect(useFileStore.getState().pendingFile).toBeNull()
  })
})
