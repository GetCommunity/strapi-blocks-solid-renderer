import { Dynamic } from "@solidjs/web"
import { createMemo, For, Show } from "solid-js"

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
  )
}

export function Text(props: TextInlineProps) {
  const [state, actions] = useBlocksRenderer()

  const modifierNames = createMemo(() =>
    Object.keys(props).filter(
      (k): k is Modifier => k !== "text" && !!props[k as Modifier],
    ),
  )

  const content = createMemo(() =>
    modifierNames().reduceRight((children, modifierName) => {
      const ModifierComponent = () => state.modifiers[modifierName]
      if (!ModifierComponent()) {
        if (!state.missingModifierTypes.includes(modifierName)) {
          console.warn(
            `[@strapi/block-solid-renderer] No component for modifier "${modifierName}"`,
          )
          actions.markModifierTypeMissing(modifierName)
        }
        return children
      }
      return <Dynamic component={ModifierComponent()}>{children}</Dynamic>
    }, replaceLineBreaks(props.text)),
  )

  return <>{content()}</>
}
