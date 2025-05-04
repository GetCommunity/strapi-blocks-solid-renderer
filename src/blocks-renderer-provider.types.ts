import type { ParentProps, Component } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"

// ------------------------------------
// Modifier and Block Definitions
// ------------------------------------

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

interface LinkInlineNode {
  type: "link"
  url: string
  children: TextInlineNode[]
}

interface ListItemInlineNode {
  type: "list-item"
  children: DefaultInlineNode[]
}

export type DefaultInlineNode = TextInlineNode | LinkInlineNode
export type NonTextInlineNode =
  | Exclude<DefaultInlineNode, TextInlineNode>
  | ListItemInlineNode

interface ParagraphBlockNode {
  type: "paragraph"
  children: DefaultInlineNode[]
}

interface QuoteBlockNode {
  type: "quote"
  children: DefaultInlineNode[]
}

interface CodeBlockNode {
  type: "code"
  children: DefaultInlineNode[]
}

interface HeadingBlockNode {
  type: "heading"
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: DefaultInlineNode[]
}

interface ListBlockNode {
  type: "list"
  format: "ordered" | "unordered"
  children: (ListItemInlineNode | ListBlockNode)[]
}

interface ImageBlockNode {
  type: "image"
  image: {
    name: string
    alternativeText?: string | null
    url: string
    caption?: string | null
    width: number
    height: number
    formats?: Record<string, unknown>
    hash: string
    ext: string
    mime: string
    size: number
    previewUrl?: string | null
    provider: string
    provider_metadata?: unknown | null
    createdAt: string
    updatedAt: string
  }
  children: [{ type: "text"; text: "" }]
}

export type RootNode =
  | ParagraphBlockNode
  | QuoteBlockNode
  | CodeBlockNode
  | HeadingBlockNode
  | ListBlockNode
  | ImageBlockNode

export type Node = RootNode | NonTextInlineNode

export type GetPropsFromNode<T> = Omit<T, "type" | "children"> & {
  children?: JSX.Element
  plainText?: T extends { type: "code" | "heading" } ? string : never
}

export type BlocksComponents = {
  [K in Node["type"]]: Component<GetPropsFromNode<Extract<Node, { type: K }>>>
}

export type ModifiersComponents = {
  [K in Modifier]: Component<{ children: JSX.Element }>
}

// ------------------------------------
// Provider Context Types
// ------------------------------------

export interface BlocksRendererProviderProps extends ParentProps {
  blocks?: Partial<BlocksComponents>
  modifiers?: Partial<ModifiersComponents>
}

export interface BlocksRendererState {
  blocks: BlocksComponents
  modifiers: ModifiersComponents
  missingBlockTypes: string[]
  missingModifierTypes: string[]
}

// eslint-disable-next-line
export interface BlocksRendererActions {}

export type BlocksRendererContextState = [
  state: BlocksRendererState,
  actions: BlocksRendererActions
]
