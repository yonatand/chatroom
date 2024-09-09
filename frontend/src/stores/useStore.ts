import { create } from "zustand";

interface State {
  username: string | null;
  setUsername: (username: string | null) => void;
}

const useStore = create<State>((set) => ({
  username: null,
  setUsername: (username: string | null) => set({ username }),
}));

export default useStore;
