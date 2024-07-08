/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnyLexicalPlan,
  InitialEditorConfig,
  LexicalPlanConfig,
  LexicalPlanDependency,
  LexicalPlanInit,
  LexicalPlanOutput,
  RegisterCleanup,
  PlanInitState,
  PlanRegisterState,
} from "@etrepum/lexical-builder-core";
import { shallowMergeConfig } from "@etrepum/lexical-builder-core";
import type { LexicalEditor } from "lexical";
import invariant from "./shared/invariant";
import type { LexicalBuilder } from "./LexicalBuilder";

export const PlanRepStateIds = {
  unmarked: 0,
  temporary: 1,
  permanent: 2,
  configured: 3,
  initialized: 4,
  registered: 5,
  afterInitialization: 6,
} as const;
interface UnmarkedState {
  id: (typeof PlanRepStateIds)["unmarked"];
}
interface TemporaryState extends Omit<UnmarkedState, "id"> {
  id: (typeof PlanRepStateIds)["temporary"];
}
interface PermanentState extends Omit<TemporaryState, "id"> {
  id: (typeof PlanRepStateIds)["permanent"];
}
interface ConfiguredState<Plan extends AnyLexicalPlan>
  extends Omit<PermanentState, "id"> {
  id: (typeof PlanRepStateIds)["configured"];
  config: LexicalPlanConfig<Plan>;
  registerState: PlanInitState;
}
interface InitializedState<Plan extends AnyLexicalPlan>
  extends Omit<ConfiguredState<Plan>, "id" | "registerState"> {
  id: (typeof PlanRepStateIds)["initialized"];
  initResult: LexicalPlanInit<Plan>;
  registerState: PlanRegisterState<LexicalPlanInit<Plan>>;
}
interface RegisteredState<Plan extends AnyLexicalPlan>
  extends Omit<InitializedState<Plan>, "id"> {
  id: (typeof PlanRepStateIds)["registered"];
  output: LexicalPlanOutput<Plan>;
}
interface AfterInitializationState<Plan extends AnyLexicalPlan>
  extends Omit<RegisteredState<Plan>, "id"> {
  id: (typeof PlanRepStateIds)["afterInitialization"];
}

export type PlanRepState<Plan extends AnyLexicalPlan> =
  | UnmarkedState
  | TemporaryState
  | PermanentState
  | ConfiguredState<Plan>
  | InitializedState<Plan>
  | RegisteredState<Plan>
  | AfterInitializationState<Plan>;

export function isExactlyUnmarkedPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is UnmarkedState {
  return state.id === PlanRepStateIds.unmarked;
}
function isExactlyTemporaryPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is TemporaryState {
  return state.id === PlanRepStateIds.temporary;
}
export function isExactlyPermanentPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is PermanentState {
  return state.id === PlanRepStateIds.permanent;
}
function isInitializedPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is
  | InitializedState<Plan>
  | RegisteredState<Plan>
  | AfterInitializationState<Plan> {
  return state.id >= PlanRepStateIds.initialized;
}
function isConfiguredPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is
  | ConfiguredState<Plan>
  | InitializedState<Plan>
  | RegisteredState<Plan>
  | AfterInitializationState<Plan> {
  return state.id >= PlanRepStateIds.configured;
}
function isRegisteredPlanRepState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is RegisteredState<Plan> | AfterInitializationState<Plan> {
  return state.id >= PlanRepStateIds.registered;
}
function isAfterInitializationState<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): state is AfterInitializationState<Plan> {
  return state.id >= PlanRepStateIds.afterInitialization;
}
export function applyTemporaryMark<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): TemporaryState {
  invariant(
    isExactlyUnmarkedPlanRepState(state),
    "LexicalBuilder: Can not apply a temporary mark to state",
  );
  return Object.assign(state, { id: PlanRepStateIds.temporary });
}
export function applyPermanentMark<Plan extends AnyLexicalPlan>(
  state: PlanRepState<Plan>,
): PermanentState {
  invariant(
    isExactlyTemporaryPlanRepState(state),
    "LexicalBuilder: Can not apply a permanent mark to state",
  );
  return Object.assign(state, { id: PlanRepStateIds.permanent });
}
export function applyConfiguredState<Plan extends AnyLexicalPlan>(
  state: PermanentState,
  config: LexicalPlanConfig<Plan>,
  registerState: PlanInitState,
): ConfiguredState<Plan> {
  return Object.assign(state, {
    id: PlanRepStateIds.configured,
    config,
    registerState,
  });
}
export function applyInitializedState<Plan extends AnyLexicalPlan>(
  state: ConfiguredState<Plan>,
  initResult: LexicalPlanInit<Plan>,
  registerState: PlanRegisterState<Plan>,
): InitializedState<Plan> {
  return Object.assign(state, {
    id: PlanRepStateIds.initialized,
    initResult,
    registerState,
  });
}
export function applyRegisteredState<Plan extends AnyLexicalPlan>(
  state: InitializedState<Plan>,
  cleanup?: RegisterCleanup<LexicalPlanOutput<Plan>> | undefined,
) {
  return Object.assign(state, {
    id: PlanRepStateIds.registered,
    output: cleanup ? cleanup.output : undefined,
  });
}
export function applyAfterInitializationState<Plan extends AnyLexicalPlan>(
  state: RegisteredState<Plan>,
): AfterInitializationState<Plan> {
  return Object.assign(state, { id: PlanRepStateIds.afterInitialization });
}

const emptySet: ReadonlySet<string> = new Set();

/**
 * @internal
 */
export class PlanRep<Plan extends AnyLexicalPlan> {
  builder: LexicalBuilder;
  configs: Set<Partial<LexicalPlanConfig<Plan>>>;
  _dependency?: LexicalPlanDependency<Plan>;
  _output?: LexicalPlanOutput<Plan>;
  _peerNameSet?: Set<string>;
  plan: Plan;
  state: PlanRepState<Plan>;
  constructor(builder: LexicalBuilder, plan: Plan) {
    this.builder = builder;
    this.plan = plan;
    this.configs = new Set();
    this.state = { id: PlanRepStateIds.unmarked };
  }

  afterInitialization(editor: LexicalEditor): undefined | (() => void) {
    const state = this.state;
    invariant(
      state.id === PlanRepStateIds.registered,
      "PlanRep: afterInitialization called in state id %s (expected %s registered)",
      String(state.id),
      String(PlanRepStateIds.registered),
    );
    let rval: undefined | (() => void);
    if (this.plan.afterInitialization) {
      rval = this.plan.afterInitialization(
        editor,
        state.config,
        state.registerState,
      );
    }
    this.state = applyAfterInitializationState(state);
    return rval;
  }
  register(editor: LexicalEditor): undefined | (() => void) {
    const state = this.state;
    invariant(
      state.id === PlanRepStateIds.initialized,
      "PlanRep: register called in state id %s (expected %s initialized)",
      String(state.id),
      String(PlanRepStateIds.initialized),
    );
    let cleanup: undefined | RegisterCleanup<LexicalPlanOutput<Plan>>;
    if (this.plan.register) {
      cleanup = this.plan.register(
        editor,
        state.config,
        state.registerState,
      ) as RegisterCleanup<LexicalPlanOutput<Plan>>;
    }
    this.state = applyRegisteredState(state, cleanup);
    return cleanup;
  }
  init(editorConfig: InitialEditorConfig, signal: AbortSignal) {
    const initialState = this.state;
    invariant(
      isExactlyPermanentPlanRepState(initialState),
      "LexicalBuilder: Can not configure from state id %s",
      String(initialState.id),
    );
    const initState: PlanInitState = {
      signal,
      getDirectDependentNames: this.getDirectDependentNames.bind(this),
      getPeerNameSet: this.getPeerNameSet.bind(this),
      getPeer: this.getInitPeer.bind(this),
      getDependency: this.getInitDependency.bind(this),
    };
    const registerState: PlanRegisterState<Plan> = {
      ...initState,
      getPeer: this.getPeer.bind(this),
      getDependency: this.getDependency.bind(this),
      getInitResult: this.getInitResult.bind(this),
    };
    const state = applyConfiguredState(
      initialState,
      this.mergeConfigs(),
      initState,
    );
    this.state = state;
    let initResult: LexicalPlanInit<Plan> | undefined;
    if (this.plan.init) {
      initResult = this.plan.init(
        editorConfig,
        state.config,
        initState,
      ) as LexicalPlanInit<Plan>;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- false positive
    this.state = applyInitializedState(state, initResult!, registerState);
  }
  getInitResult(): LexicalPlanInit<Plan> {
    invariant(
      this.plan.init !== undefined,
      "PlanRep: getInitResult() called for Plan %s that does not define init",
      this.plan.name,
    );
    const state = this.state;
    invariant(
      isInitializedPlanRepState(state),
      "PlanRep: getInitResult() called for PlanRep in state id %s < %s (initialized)",
      String(state.id),
      String(PlanRepStateIds.initialized),
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- any
    return state.initResult;
  }

  getInitPeer<PeerPlan extends AnyLexicalPlan = never>(
    name: PeerPlan["name"],
  ): undefined | Omit<LexicalPlanDependency<PeerPlan>, "output"> {
    const rep = this.builder.planNameMap.get(name);
    return rep ? rep.getPlanInitDependency() : undefined;
  }

  getPlanInitDependency(): Omit<LexicalPlanDependency<Plan>, "output"> {
    const state = this.state;
    invariant(
      isConfiguredPlanRepState(state),
      "LexicalPlanBuilder: getPlanInitDependency called in state id %s (expected >= %s configured)",
      String(state.id),
      String(PlanRepStateIds.configured),
    );
    return { config: state.config };
  }

  getPeer<PeerPlan extends AnyLexicalPlan = never>(
    name: PeerPlan["name"],
  ): undefined | LexicalPlanDependency<PeerPlan> {
    const rep = this.builder.planNameMap.get(name);
    return rep
      ? (rep.getPlanDependency() as LexicalPlanDependency<PeerPlan>)
      : undefined;
  }

  getInitDependency<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): Omit<LexicalPlanDependency<Dependency>, "output"> {
    const rep = this.builder.getPlanRep(dep);
    invariant(
      rep !== undefined,
      "LexicalPlanBuilder: Plan %s missing dependency plan %s to be in registry",
      this.plan.name,
      dep.name,
    );
    return rep.getPlanInitDependency();
  }

  getDependency<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): LexicalPlanDependency<Dependency> {
    const rep = this.builder.getPlanRep(dep);
    invariant(
      rep !== undefined,
      "LexicalPlanBuilder: Plan %s missing dependency plan %s to be in registry",
      this.plan.name,
      dep.name,
    );
    return rep.getPlanDependency();
  }

  getState(): AfterInitializationState<Plan> {
    const state = this.state;
    invariant(
      isAfterInitializationState(state),
      "PlanRep getState called in state id %s (expected %s afterInitialization)",
      String(state.id),
      String(PlanRepStateIds.afterInitialization),
    );
    return state;
  }

  getDirectDependentNames(): ReadonlySet<string> {
    return this.builder.incomingEdges.get(this.plan.name) || emptySet;
  }

  getPeerNameSet(): ReadonlySet<string> {
    let s = this._peerNameSet;
    if (!s) {
      s = new Set((this.plan.peerDependencies || []).map(([name]) => name));
      this._peerNameSet = s;
    }
    return s;
  }

  getPlanDependency(): LexicalPlanDependency<Plan> {
    if (!this._dependency) {
      const state = this.state;
      invariant(
        isRegisteredPlanRepState(state),
        "Plan %s used as a dependency before registration",
        this.plan.name,
      );
      this._dependency = {
        config: state.config,
        output: state.output,
      };
    }
    return this._dependency;
  }
  mergeConfigs(): LexicalPlanConfig<Plan> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- LexicalPlanConfig<Plan> is any
    let config: LexicalPlanConfig<Plan> = this.plan.config || {};
    const mergeConfig = this.plan.mergeConfig
      ? this.plan.mergeConfig.bind(this.plan)
      : shallowMergeConfig;
    for (const cfg of this.configs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- LexicalPlanConfig<Plan> is any
      config = mergeConfig(config, cfg);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- any
    return config;
  }
}
