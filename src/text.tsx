import { For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"

import { useBlocksRenderer } from "./blocks-renderer-provider.ui"

export interface TextInlineNode {
  type: "text"
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export type Modifier = Exclude<keyof TextInlineNode, "type" | "text">

type TextInlineProps = Omit<TextInlineNode, "type">

function replaceLineBreaks(text: string) {
  const parts = text.split(/\r?\n|\r/g)
  return (
    <>
      <For each={parts}>
        {(part, idx) => (
          <>
            <Show when={idx() > 0}>
              <br />
            </Show>
            {part}
          </>
        )}
      </For>
    </>
  )
}

export function Text(props: TextInlineProps) {
  const [state] = useBlocksRenderer()
  const modifierComponents = state.modifiers

  const modifierNames = Object.keys(props).filter(
    (k): k is Modifier => k !== "text" && !!props[k as Modifier]
  )

  // Use a Set to track warnings without mutating Solid Store directly
  const seenWarnings = new Set<string>()

  return modifierNames.reduceRight((children, modifierName) => {
    const ModifierComponent = modifierComponents[modifierName]
    if (!ModifierComponent) {
      if (!seenWarnings.has(modifierName)) {
        console.warn(
          `[@strapi/block-solid-renderer] No component for modifier "${modifierName}"`
        )
        seenWarnings.add(modifierName)
      }
      return children
    }
    return <Dynamic component={ModifierComponent}>{children}</Dynamic>
  }, replaceLineBreaks(props.text))
}
