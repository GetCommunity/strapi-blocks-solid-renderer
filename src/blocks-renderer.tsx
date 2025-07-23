import { For } from "solid-js"
import { Block } from "./block"
import type {
  BlocksContent,
  BlocksRendererProviderProps
} from "./blocks-renderer-provider.types"
import { BlocksRendererProvider } from "./blocks-renderer-provider.ui"

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
