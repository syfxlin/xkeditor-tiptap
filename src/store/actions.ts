import {state} from "./state";

export const actions = {
  addCount() {
    state.count++;
  }
};

export type Actions = typeof actions;
