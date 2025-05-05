// FILE: blocks-renderer.test.tsx
import { render, screen } from "@solidjs/testing-library"
import { describe, it, expect, vi } from "vitest"
import { isServer } from "solid-js/web"

console.log("isServer", isServer) // should log: false

import { BlocksRenderer } from "../src/blocks-renderer"

import type { BlocksContent } from "../src/blocks-renderer-provider.types"

const content: BlocksContent[] = [
  {
    type: "heading",
    level: 1,
    children: [
      {
        type: "link",
        url: "https://test.com",
        children: [{ type: "text", text: "A cool website" }]
      }
    ]
  },
  {
    type: "paragraph",
    children: [
      { type: "text", text: "A simple paragraph" },
      { type: "text", text: "with bold text", bold: true },
      { type: "text", text: " and bold underlines", bold: true, underline: true }
    ]
  }
]

describe("BlocksRenderer", () => {
  it("renders basic paragraph and heading content", () => {
    render(() => <BlocksRenderer content={content} />)

    expect(screen.getByText("A simple paragraph")).toBeInstanceOf(HTMLParagraphElement)
    expect(screen.getByRole("heading", { name: /cool website/i })).toBeInstanceOf(
      HTMLHeadingElement
    )
  })

  it("uses custom components when provided", () => {
    render(() => (
      <BlocksRenderer
        content={content}
        blocks={{
          paragraph: (props) => (
            <div data-testid="customParagraph">{props.children}</div>
          ),
          link: (props) => <button>{props.children}</button>
        }}
        modifiers={{
          bold: (props) => <b data-testid="customBold">{props.children}</b>
        }}
      />
    ))

    expect(screen.getByTestId("customParagraph")).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByRole("button", { name: /cool website/i })).toBeInstanceOf(
      HTMLButtonElement
    )

    const boldTags = screen.getAllByTestId("customBold")
    console.log("boldTags", boldTags)
    expect(boldTags).toHaveLength(2)
    expect(boldTags[0]).toHaveTextContent("with bold text")
    expect(boldTags[1]).toHaveTextContent("and bold underlines")

    const underline = document.querySelector("u")
    expect(underline).toHaveTextContent("and bold underlines")
  })

  it("renders empty paragraph as <br>", () => {
    render(() => (
      <BlocksRenderer
        content={[
          { type: "paragraph", children: [{ type: "text", text: "Before" }] },
          { type: "paragraph", children: [{ type: "text", text: "" }] },
          { type: "paragraph", children: [{ type: "text", text: "After" }] }
        ]}
      />
    ))

    const brElement = screen.getByText("Before").nextElementSibling
    expect(brElement).toBeInstanceOf(HTMLBRElement)
    expect(brElement?.tagName).toBe("BR")
  })

  it("renders line breaks in text", () => {
    render(() => (
      <BlocksRenderer
        content={[
          {
            type: "paragraph",
            children: [{ type: "text", text: "First line\nSecond line" }]
          }
        ]}
      />
    ))

    const paragraph = screen.getByText((content) => content.startsWith("First line"))
    expect(paragraph?.innerHTML).toContain("<br>")
  })

  it("handles missing block type gracefully", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    render(() => (
      <BlocksRenderer
        content={[
          {
            // @ts-expect-error - type invalid
            type: "unknown",
            children: [{ type: "text", text: "Oops" }]
          }
        ]}
      />
    ))

    expect(screen.queryByText("Oops")).not.toBeInstanceOf(HTMLUnknownElement)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No component for block type "unknown"')
    )

    warnSpy.mockRestore()
  })

  it("renders modifiers in nesting order", () => {
    render(() => (
      <BlocksRenderer
        content={[
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Styled",
                bold: true,
                italic: true,
                underline: true
              }
            ]
          }
        ]}
      />
    ))

    const text = screen.getByText("Styled")
    expect(text.closest("strong")).toBeTruthy()
    expect(text.closest("em")).toBeTruthy()
    expect(text.closest("u")).toBeTruthy()
  })
})
