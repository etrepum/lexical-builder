# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

All instructions are designed to be run from the root of the monorepo.

https://lexical-builder.pages.dev/

### Installation

```
$ npm i
```

### Local Development

```
$ npm run dev -- -F docs
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ npm run build -- -F docs
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.
