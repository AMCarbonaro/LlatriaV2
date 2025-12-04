import { create } from 'zustand';
import { InventoryItem } from '@/types/inventory';

type HistoryAction = 
  | { type: 'add'; item: InventoryItem }
  | { type: 'update'; itemId: string; oldItem: InventoryItem; newItem: InventoryItem }
  | { type: 'delete'; item: InventoryItem }
  | { type: 'bulk_delete'; items: InventoryItem[] };

interface HistoryState {
  past: HistoryAction[];
  future: HistoryAction[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => HistoryAction | undefined;
  redo: () => HistoryAction | undefined;
  addAction: (action: HistoryAction) => void;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  addAction: (action) => {
    set((state) => {
      const newPast = [...state.past, action].slice(-MAX_HISTORY);
      return {
        past: newPast,
        future: [], // Clear future when new action is added
        canUndo: newPast.length > 0,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const lastAction = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    const newFuture = [lastAction, ...state.future];

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });

    // Return the action so it can be applied
    return lastAction;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const nextAction = state.future[0];
    const newFuture = state.future.slice(1);
    const newPast = [...state.past, nextAction];

    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });

    // Return the action so it can be applied
    return nextAction;
  },

  clear: () => {
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },
}));

