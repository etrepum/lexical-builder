/* eslint-disable @typescript-eslint/naming-convention, no-redeclare -- weird style requirement for this to work */
/** @internal */
export declare const peerDependencySymbol: unique symbol;
/** @internal */
export type peerDependencySymbol = typeof peerDependencySymbol;
/** @internal */
export declare const configTypeSymbol: unique symbol;
/** @internal */
export type configTypeSymbol = typeof configTypeSymbol;
/** @internal */
export declare const outputTypeSymbol: unique symbol;
/** @internal */
export type outputTypeSymbol = typeof outputTypeSymbol;
/** @internal */
export declare const initTypeSymbol: unique symbol;
/** @internal */
export type initTypeSymbol = typeof initTypeSymbol;

/** @internal */
export interface LexicalPlanInternal<out Config, out Output, out Init> {
  /** @internal */
  readonly [configTypeSymbol]?: Config;
  /** @internal */
  readonly [outputTypeSymbol]?: Output;
  /** @internal */
  readonly [initTypeSymbol]?: Init;
}
