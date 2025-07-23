import { createContext, Match, mergeProps, Switch, useContext } from "solid-js"
import { type JSX } from "solid-js/jsx-runtime"
import { createStore } from "solid-js/store"
import { Dynamic } from "solid-js/web"
import type {
  BlocksComponents,
  BlocksRendererActions,
  BlocksRendererContextState,
  BlocksRendererProviderProps,
  BlocksRendererState,
  ModifiersComponents
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
      const hProps = mergeProps(
        {
          level: 1
        },
        props
      )
      const Tag = () => `h${hProps.level}` as keyof JSX.IntrinsicElements
      return <Dynamic component={Tag()}>{hProps.children}</Dynamic>
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
    )
  } as BlocksComponents,
  modifiers: {
    bold: (props) => <strong>{props.children}</strong>,
    italic: (props) => <em>{props.children}</em>,
    underline: (props) => <u>{props.children}</u>,
    strikethrough: (props) => <del>{props.children}</del>,
    code: (props) => <code>{props.children}</code>
  } as ModifiersComponents,
  missingBlockTypes: [],
  missingModifierTypes: []
}

// ------------------------------------
// Context Setup
// ------------------------------------

const BlocksRendererContext = createContext<BlocksRendererContextState>()

export function BlocksRendererProvider(props: BlocksRendererProviderProps) {
  const blocks = () => ({ ...defaultComponents.blocks, ...props.blocks })
  const modifiers = () => ({ ...defaultComponents.modifiers, ...props.modifiers })

  const [state] = createStore<BlocksRendererState>({
    // eslint-disable-next-line solid/reactivity
    blocks: blocks(),
    // eslint-disable-next-line solid/reactivity
    modifiers: modifiers(),
    missingBlockTypes: [],
    missingModifierTypes: []
  })

  const actions: BlocksRendererActions = {}

  const contextValue: BlocksRendererContextState = [state, actions]

  return (
    <BlocksRendererContext.Provider value={contextValue}>
      {props.children}
    </BlocksRendererContext.Provider>
  )
}

export function useBlocksRenderer(): BlocksRendererContextState {
  const context = useContext(BlocksRendererContext)
  if (!context)
    throw new Error("<BlocksRendererProvider> is missing in the component tree")
  return context
}
