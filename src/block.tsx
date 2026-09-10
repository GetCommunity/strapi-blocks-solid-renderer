import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
import { For, Match, onSettled, Switch } from "solid-js"

import { useBlocksRenderer } from "./blocks-renderer-provider.ui"
import { Text } from "./text"

import type {
  BlocksContentNode,
  GetPropsFromNode
} from "./blocks-renderer-provider.types"

export interface BlockProps {
  content: BlocksContentNode
}

const voidTypes = ["image"]

function augmentProps(content: BlocksContentNode) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { children: childrenNodes, type, ...props } = content as any

  if (type === "code" || type === "heading") {
    const getPlainText = (children: typeof childrenNodes): string => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return children.reduce((text: string, node: any) => {
        if (node.type === "text") return text + node.text
        if (node.type === "link") return text + getPlainText(node.children)
        return text
      }, "")
    }

    return {
      ...props,
      plainText: getPlainText(childrenNodes)
    }
  }

  return props
}

export function Block(props: BlockProps) {
  const [state, actions] = useBlocksRenderer()
  const BlockComponent = () =>
    state.blocks[props.content.type] as (props: GetPropsFromNode<Node>) => JSX.Element
  onSettled(() => {
    const type = props.content.type
    if (!BlockComponent() && !state.missingBlockTypes.includes(type)) {
      console.warn(
        `[@strapi/block-solid-renderer] No component for block type "${type}"`
      )
      actions.markBlockTypeMissing(type)
    }
  })

  const augmentedProps = () => augmentProps(props.content)

  return (
    <>
      <Switch>
        <Match when={voidTypes.includes(props.content.type)}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Dynamic component={BlockComponent()} {...(props.content as any)} />
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
        <Match when={BlockComponent()}>
          <Dynamic component={BlockComponent()} {...augmentedProps()}>
            <For each={props.content.children}>
              {(child) => {
                if (child.type === "text") {
                  const { type: _type, ...childProps } = child
                  return <Text {...childProps} />
                }
                return <Block content={child as BlocksContentNode} />
              }}
            </For>
          </Dynamic>
        </Match>
      </Switch>
    </>
  )
}
