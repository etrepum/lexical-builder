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
