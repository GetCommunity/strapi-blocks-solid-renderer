import { dynamic } from "@solidjs/web"
import { createEffect, For, Show } from "solid-js"
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

// Order is outermost → innermost wrapper.
const MODIFIERS: readonly Modifier[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
]

function LineBreaks(props: { text: string }) {
  return (
    <For each={props.text.split(/\r?\n|\r/g)} keyed={false}>
      {(part, idx) => (
        <>
          {idx > 0 && <br />}
          {part()}
        </>
      )}
    </For>
  )
}

function Modified(props: { modifiers: readonly Modifier[]; text: string }) {
  const [state] = useBlocksRenderer()
  const ModifierComponent = dynamic(() => state.modifiers[props.modifiers[0]])
  const inner = () => (
    <Modified modifiers={props.modifiers.slice(1)} text={props.text} />
  )

  return (
    <Show when={props.modifiers.length > 0} fallback={<LineBreaks text={props.text} />}>
      <Show when={state.modifiers[props.modifiers[0]]} fallback={inner()}>
        <ModifierComponent>{inner()}</ModifierComponent>
      </Show>
    </Show>
  )
}

export function Text(props: TextInlineProps) {
  const [state, { reportMissing }] = useBlocksRenderer()
  const active = () => MODIFIERS.filter((modifier) => props[modifier])

  createEffect(
    () => active().filter((modifier) => !state.modifiers[modifier]),
    (missing) => {
      for (const modifier of missing) reportMissing("modifier", modifier)
    },
  )

  return <Modified modifiers={active()} text={props.text} />
}
