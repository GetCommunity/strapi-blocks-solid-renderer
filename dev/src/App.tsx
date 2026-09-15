import { createSignal } from "solid-js"
import { BlocksRenderer } from "../../src/blocks-renderer"
import type { BlocksContent } from "../../src/blocks-renderer-provider.types"
import logo from "./logo.svg"
import "./App.css"

const content: BlocksContent[] = [
  {
    type: "heading",
    level: 1,
    children: [
      {
        type: "link",
        url: "https://test.com",
        children: [{ type: "text", text: "A cool website" }],
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      { type: "text", text: "A simple paragraph " },
      { type: "text", text: "with bold text", bold: true },
      { type: "text", text: " " },
      { type: "text", text: "and bold underlines", bold: true, underline: true },
    ],
  },
]

export default function App() {
  const [count, setCount] = createSignal(0)

  return (
    <header class="header">
      <img src={logo} class="logo" alt="Solid logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <button type="button" class="increment" onClick={() => setCount(count() + 1)}>
        Clicks: {count()}
      </button>
      <a
        class="link"
        href="https://v2.solidjs.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn Solid
      </a>
      <BlocksRenderer content={content} />
    </header>
  )
}
