import { describe, it, expect } from "vitest"
import { isValidPageRange, isValidPdfPath, isNonEmpty } from "../validators"

describe("isValidPageRange", () => {
  it("accepts single page", () => {
    expect(isValidPageRange("1")).toBe(true)
  })

  it("accepts page range", () => {
    expect(isValidPageRange("1-5")).toBe(true)
  })

  it("accepts mixed pages and ranges", () => {
    expect(isValidPageRange("1-5,8,10-12")).toBe(true)
  })

  it("accepts pages with spaces", () => {
    expect(isValidPageRange("1 - 5, 8")).toBe(true)
  })

  it("rejects empty string", () => {
    expect(isValidPageRange("")).toBe(false)
  })

  it("rejects whitespace only", () => {
    expect(isValidPageRange("   ")).toBe(false)
  })

  it("rejects letters", () => {
    expect(isValidPageRange("abc")).toBe(false)
  })

  it("rejects invalid range format", () => {
    expect(isValidPageRange("1-")).toBe(false)
  })

  it("rejects double dash", () => {
    expect(isValidPageRange("1--5")).toBe(false)
  })

  it("rejects negative numbers", () => {
    expect(isValidPageRange("-1")).toBe(false)
  })
})

describe("isValidPdfPath", () => {
  it("accepts .pdf extension", () => {
    expect(isValidPdfPath("/path/to/file.pdf")).toBe(true)
  })

  it("accepts .PDF uppercase", () => {
    expect(isValidPdfPath("/path/to/file.PDF")).toBe(true)
  })

  it("rejects .txt", () => {
    expect(isValidPdfPath("/path/to/file.txt")).toBe(false)
  })

  it("rejects no extension", () => {
    expect(isValidPdfPath("/path/to/file")).toBe(false)
  })
})

describe("isNonEmpty", () => {
  it("accepts non-empty string", () => {
    expect(isNonEmpty("hello")).toBe(true)
  })

  it("rejects empty string", () => {
    expect(isNonEmpty("")).toBe(false)
  })

  it("rejects whitespace only", () => {
    expect(isNonEmpty("   ")).toBe(false)
  })
})
