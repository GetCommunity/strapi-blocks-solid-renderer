import { dynamic } from "@solidjs/web"
import { createEffect, For, Match, Switch } from "solid-js"
import type { BlocksContentNode } from "./blocks-renderer-provider.types"
import { useBlocksRenderer } from "./blocks-renderer-provider.ui"
import { Text } from "./text"

export interface BlockProps {
  content: BlocksContentNode
}

const voidTypes = ["image"]

function augmentProps(content: BlocksContentNode) {
  // biome-ignore lint/suspicious/noExplicitAny: BlocksContentNode is a discriminated union; destructuring shared fields across variants needs an escape hatch.
  const { children: childrenNodes, type, ...props } = content as any

  if (type === "code" || type === "heading") {
    const getPlainText = (children: typeof childrenNodes): string => {
      // biome-ignore lint/suspicious/noExplicitAny: node shape varies by block type here.
      return children.reduce((text: string, node: any) => {
        if (node.type === "text") return text + node.text
        if (node.type === "link") return text + getPlainText(node.children)
        return text
      }, "")
    }

    return {
      ...props,
      plainText: getPlainText(childrenNodes),
    }
  }

  return props
}

export function Block(props: BlockProps) {
  const [state, { reportMissing }] = useBlocksRenderer()
  const BlockComponent = dynamic(() => state.blocks[props.content.type])
  const augmentedProps = () => augmentProps(props.content)

  createEffect(
    () => (state.blocks[props.content.type] ? undefined : props.content.type),
    (missingType) => {
      if (missingType) reportMissing("block type", missingType)
    },
  )

  return (
    <Switch>
      <Match when={voidTypes.includes(props.content.type)}>
        {/* biome-ignore lint/suspicious/noExplicitAny: allow any */}
        <BlockComponent {...(props.content as any)} />
      </Match>
      <Match
        when={
          props.content.type === "paragraph" &&
          props.content.children.length === 1 &&
          props.content.children[0].type === "text" &&
          props.content.children[0].text === ""
        }
      >
        <br />
      </Match>
      <Match when={state.blocks[props.content.type]}>
        <BlockComponent {...augmentedProps()}>
          <For each={props.content.children}>
            {(child) => {
              if (child.type === "text") {
                const { type: _type, ...childProps } = child
                return <Text {...childProps} />
              }
              return <Block content={child as BlocksContentNode} />
            }}
          </For>
        </BlockComponent>
      </Match>
    </Switch>
  )
}
