import { dynamic, type JSX } from "@solidjs/web"
import { createContext, createMemo, Match, merge, Switch, useContext } from "solid-js"
import type {
  BlocksComponents,
  BlocksRendererActions,
  BlocksRendererContextState,
  BlocksRendererProviderProps,
  BlocksRendererState,
  ModifiersComponents,
} from "./blocks-renderer-provider.types"

// ------------------------------------
// Default Components
// ------------------------------------

const defaultComponents: BlocksRendererState = {
  blocks: {
    paragraph: (props) => <p>{props.children}</p>,
    quote: (props) => <blockquote>{props.children}</blockquote>,
    code: (props) => (
      <pre>
        <code>{props.plainText}</code>
      </pre>
    ),
    heading: (props) => {
      const hProps = merge(
        {
          level: 1,
        },
        props,
      )
      const Tag = dynamic(() => `h${hProps.level}` as keyof JSX.IntrinsicElements)
      return <Tag {...props}>{hProps.children}</Tag>
    },
    link: (props) => <a href={props.url}>{props.children}</a>,
    list: (props) => (
      <Switch>
        <Match when={props.format === "ordered"}>
          <ol>{props.children}</ol>
        </Match>
        <Match when={props.format === "unordered"}>
          <ul>{props.children}</ul>
        </Match>
      </Switch>
    ),
    "list-item": (props) => <li>{props.children}</li>,
    image: (props) => (
      <img
        src={props.image.url}
        alt={props.image.alternativeText || undefined}
        loading="lazy"
      />
    ),
  } as BlocksComponents,
  modifiers: {
    bold: (props) => <strong>{props.children}</strong>,
    italic: (props) => <em>{props.children}</em>,
    underline: (props) => <u>{props.children}</u>,
    strikethrough: (props) => <del>{props.children}</del>,
    code: (props) => <code>{props.children}</code>,
  } as ModifiersComponents,
}

// ------------------------------------
// Context Setup
// ------------------------------------

const BlocksRendererContext = createContext<BlocksRendererContextState>()

export function BlocksRendererProvider(props: BlocksRendererProviderProps) {
  const blocks = createMemo(() => ({ ...defaultComponents.blocks, ...props.blocks }))
  const modifiers = createMemo(() => ({
    ...defaultComponents.modifiers,
    ...props.modifiers,
  }))

  const state: BlocksRendererState = {
    get blocks() {
      return blocks()
    },
    get modifiers() {
      return modifiers()
    },
  }

  // Plain Set: warning bookkeeping must not be reactive state.
  const reported = new Set<string>()
  const actions: BlocksRendererActions = {
    reportMissing(kind, name) {
      const key = `${kind}:${name}`
      if (reported.has(key)) return
      reported.add(key)
      console.warn(`[@strapi/block-solid-renderer] No component for ${kind} "${name}"`)
    },
  }

  const contextValue: BlocksRendererContextState = [state, actions]

  return (
    <BlocksRendererContext value={contextValue}>{props.children}</BlocksRendererContext>
  )
}

export function useBlocksRenderer(): BlocksRendererContextState {
  const context = useContext(BlocksRendererContext)
  if (!context)
    throw new Error("<BlocksRendererProvider> is missing in the component tree")
  return context
}
