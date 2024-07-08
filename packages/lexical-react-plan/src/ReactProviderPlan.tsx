import { definePlan } from "@etrepum/lexical-builder";

/**
 * A plan used to declare that there is a LexicalPlanComposer or
 * ReactPluginHostPlan available so that we can issue runtime warnings
 * when plugins that depend on React are hosted in an environment
 * where it is not ever going to be rendered.
 *
 * It is a separate plan so it can be used as a peer dependency.
 */
export const ReactProviderPlan = definePlan({
  name: "@etrepum/lexical-builder/ReactProvider",
});
