# Strapi Blocks SolidJS Renderer

This is a SolidJS implementation of the [Strapi Blocks Renderer](https://github.com/strapi/blocks-react-renderer).

Easily render the content of Strapi's new Blocks rich text editor in your SolidJS frontend.

## Installation

Install the Blocks renderer and its peer dependencies:

```sh
yarn add @getcommunity/strapi-blocks-solid-renderer solid-js @solidjs/web
```

```sh
pnpm add @getcommunity/strapi-blocks-solid-renderer solid-js @solidjs/web
```

```sh
npm install @getcommunity/strapi-blocks-solid-renderer solid-js @solidjs/web
```

> Targets Solid 2.0 (currently `2.0.0-rc.7`). `@solidjs/web` is Solid's DOM
> renderer package in 2.0 and must be installed alongside `solid-js`.

## Basic usage

After fetching your Strapi content, you can use the BlocksRenderer component to render the data from a blocks attribute. Pass the array of blocks coming from your Strapi API to the `content` prop:

```jsx
import { BlocksRenderer, type BlocksContent } from '@getcommunity/strapi-blocks-solid-renderer';

// Content should come from your Strapi API
const content: BlocksContent[] = [
  {
    type: 'paragraph',
    children: [{ type: 'text', text: 'A simple paragraph' }],
  },
];

const App = () => {
  return <BlocksRenderer content={content} />;
};
```

## Custom components

You can provide your own SolidJS components to the renderer, both for blocks and modifier. They will be merged with the default components, so you can override only the ones you need.

- **Blocks** are full-width elements, usually at the root of the content. The available options are:
  - paragraph
  - heading (receives `level` and `plainText`)
  - list (receives `format`)
  - quote
  - code (receives `plainText`)
  - image (receives `image`)
  - link (receives `url`)
- **Modifiers** are inline elements, used to change the appearance of fragments of text within a block. The available options are:
  - bold
  - italic
  - underline
  - strikethrough
  - code

To provide your own components, pass an object to the `blocks` and `modifiers` props of the renderer. For each type, the value should be a SolidJS component that will receive the props of the block or modifier. Make sure to always render the children, so that the nested blocks and modifiers are rendered as well.

```jsx
import { BlocksRenderer } from '@getcommunity/strapi-blocks-solid-renderer';

// Content should come from your Strapi API
const content = [
  {
    type: 'paragraph',
    children: [{ type: 'text', text: 'A simple paragraph' }],
  },
];

const App = () => {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        // You can use the default components to set class names...
        paragraph: (props) => <p class="text-neutral900 max-w-prose">{props.children}</p>,
        // ...or point to a design system
        heading: (props) => {
          switch (props.level) {
            case 1:
              return <Typography variant="h1">{props.children}</Typography>
            case 2:
              return <Typography variant="h2">{props.children}</Typography>
            case 3:
              return <Typography variant="h3">{props.children}</Typography>
            case 4:
              return <Typography variant="h4">{props.children}</Typography>
            case 5:
              return <Typography variant="h5">{props.children}</Typography>
            case 6:
              return <Typography variant="h6">{props.children}</Typography>
            default:
              return <Typography variant="h1">{props.children}</Typography>
          }
        },
        // For links, you may want to use the component from your router or framework
        link: (props) => <Link to={props.url}>{props.children}</Link>,
      }}
      modifiers={{
        bold: (props) => <strong>{props.children}</strong>,
        italic: (props) => <span class="italic">{props.children}</span>,
      }}
    />
  );
};
```
