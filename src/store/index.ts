import { createStore } from "@/store/hook";
import { State, state } from "@/store/state";
import { Actions, actions } from "@/store/actions";

export { state, State } from "@/store/state";
export { actions, Actions } from "@/store/actions";
export * from "@/store/hook";

export const store = createStore(state, actions);
export type Store = {
  state: State;
  actions: Actions;
};
