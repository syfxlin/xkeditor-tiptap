import { createState } from "@/store/hook";

const initialState = {
  count: 0
};

export const state = createState(initialState);
export type State = typeof initialState;
