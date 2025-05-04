import { For, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"

import { useBlocksRenderer } from "./blocks-renderer-provider.ui"
import { Text } from "./text"

import type { Node, GetPropsFromNode } from "./blocks-renderer-provider.types"

export interface BlockProps {
  content: Node
}

const voidTypes = ["image"]

function augmentProps(content: Node) {
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
  const [state] = useBlocksRenderer()
  const BlockComponent = state.blocks[props.content.type] as (
    props: GetPropsFromNode<Node>
  ) => JSX.Element

  if (!BlockComponent) {
    if (!state.missingBlockTypes.includes(props.content.type)) {
      console.warn(
        `[@strapi/block-solid-renderer] No component for block type "${props.content.type}"`
      )
      state.missingBlockTypes.push(props.content.type)
    }
    return null
  }

  if (voidTypes.includes(props.content.type)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Dynamic component={BlockComponent} {...(props.content as any)} />
  }

  if (
    props.content.type === "paragraph" &&
    props.content.children.length === 1 &&
    props.content.children[0].type === "text" &&
    props.content.children[0].text === ""
  ) {
    return <br />
  }

  const augmentedProps = augmentProps(props.content)

  return (
    <Dynamic component={BlockComponent} {...augmentedProps}>
      <For each={props.content.children}>
        {(child) => {
          if (child.type === "text") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { type: _type, ...childProps } = child
            return <Text {...childProps} />
          }
          return <Block content={child as Node} />
        }}
      </For>
    </Dynamic>
  )
}
