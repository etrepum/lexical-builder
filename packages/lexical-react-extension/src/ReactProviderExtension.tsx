import { defineExtension } from "@etrepum/lexical-builder";

/**
 * An extension used to declare that there is a LexicalExtensionComposer or
 * ReactPluginHostExtension available so that we can issue runtime warnings
 * when plugins that depend on React are hosted in an environment
 * where it is not ever going to be rendered.
 *
 * It is a separate extension so it can be used as a peer dependency.
 */
export const ReactProviderExtension = defineExtension({
  name: "@etrepum/lexical-builder/ReactProvider",
});
