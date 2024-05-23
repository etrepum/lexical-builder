---
sidebar_position: 1
---

# @etrepum/lexical-builder intro

**EXPERIMENTAL** A high-level way to manage Lexical config and plug-ins for any framework

The intent of this package is to become or inspire a de jure standard in Lexical for a
next generation of plug-ins.

[[RFC] Lexical Builder API](https://docs.google.com/document/d/1wQYb9Y-zVb_jGyQSHYQuPuGs5xGPHBST_3OOaLXG0s0/edit)

# Why?

Lexical Builder attempts to solve several problems with code re-use
and scaffolding in Lexical:

* Plug-ins can only support code that can be asynchronously added to a
  LexicalEditor after construction, but most use cases also require
  configuration that must be specified synchronously during construction
  (such as any new nodes that are being registered)
* Plug-ins are all React dependent. There is no standard to package code
  that can support both React and non-React use cases from the same
  package, whether or not the package has React dependencies
* Configuration is verbose, several properties of the editor or
  LexicalComposer have "obvious" defaults that must be specified
* Configuration is not composable, it is not easy to copy and paste
  an editor together because at minimum you must edit two places
  (config and plug-ins) and the config section requires manual merging of
  the nodes and theme properties.
* The nature of using a context and hooks to set up the editor can be
  cumbersome, having to author a top-level component for each piece
  of code that has to interact with the editor

# Examples

## Vanilla JS Plan

- [GitHub](https://github.com/etrepum/lexical-builder/blob/main/apps/vanilla-js-plan/src/main.ts)
- [Stackblitz](https://stackblitz.com/github/etrepum/lexical-builder/tree/main/apps/vanilla-js-plan?file=src%2Fmain.ts)

This one uses LexicalBuilder in a "Vanilla JS" context
(really TypeScript + Vite, but that's what it's called in the Lexical monorepo).
The application does not have any direct React dependencies or JSX
compilation, but via the `ReactPluginHostPlan` it can mount the `TreeView`
component from `@lexical/react`!

I think this one is great because it shows us a potential future where people
can use all of the great React based plug-ins that have been developed, even
if they don't want to directly use React themselves. This one requires a bit
more props configuration than most beacuse of the classes 

## React Rich Collab Plan

- [GitHub](https://github.com/etrepum/lexical-builder/blob/main/apps/react-rich-collab-plan/src/App.tsx)
- [Stackblitz](https://stackblitz.com/github/etrepum/lexical-builder/tree/main/apps/react-rich-collab-plan?file=src%2FApp.tsx)

This one demonstrates full compatibility with the existing React plug-in
convention. The transition from using LexicalComposer to LexicalPlanCompser is
very smooth and straightforward. When using the stackblitz go to the ports tab
and choose 5173 if you see a page that says "okay".
