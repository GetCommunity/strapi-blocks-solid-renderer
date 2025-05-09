import { For } from "solid-js"
import type {
  BlocksRendererProviderProps,
  BlocksContent
} from "./blocks-renderer-provider.types"
import { BlocksRendererProvider } from "./blocks-renderer-provider.ui"
import { Block } from "./block"

export interface BlocksRendererProps extends BlocksRendererProviderProps {
  content: BlocksContent[]
}

export function BlocksRenderer(props: BlocksRendererProps) {
  return (
    <BlocksRendererProvider blocks={props.blocks} modifiers={props.modifiers}>
      <For each={props.content}>{(block) => <Block content={block} />}</For>
    </BlocksRendererProvider>
  )
}
