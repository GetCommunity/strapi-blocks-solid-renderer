import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
import {
  createContext,
  createStore,
  Match,
  merge,
  Switch,
  untrack,
  useContext
} from "solid-js"
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
      const hProps = merge(
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
  // `props.blocks`/`props.modifiers` are only ever read here, once, to seed
  // the store's initial value — untrack() marks that intentionally, since
  // reading props at the top of a component body is otherwise flagged.
  const [state, setState] = createStore<BlocksRendererState>({
    blocks: untrack(() => ({ ...defaultComponents.blocks, ...props.blocks })),
    modifiers: untrack(() => ({ ...defaultComponents.modifiers, ...props.modifiers })),
    missingBlockTypes: [],
    missingModifierTypes: []
  })

  const actions: BlocksRendererActions = {
    markBlockTypeMissing(type) {
      setState((s) => {
        if (!s.missingBlockTypes.includes(type)) s.missingBlockTypes.push(type)
      })
    },
    markModifierTypeMissing(type) {
      setState((s) => {
        if (!s.missingModifierTypes.includes(type)) s.missingModifierTypes.push(type)
      })
    }
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
