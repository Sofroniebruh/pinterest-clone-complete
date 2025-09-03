import { createStore } from 'zustand/vanilla';

type DialogType = {
  name: 'deleteComment' | 'deletePost' | 'deleteAccount' | 'editComment' | 'smallSearch';
}

export interface Dialog {
  key: DialogType,
  value: boolean,
}

interface DialogStore {
  dialogs: Dialog[];
  isDialogOpen: (name: DialogType['name']) => boolean;
  setIsOpen: (isOpen: boolean, dialog: Dialog) => void;
  setAllClosed: () => void;
}

export const dialogStore = createStore<DialogStore>((set, get) => ({
  dialogs: [],
  setIsOpen: (open: boolean, dialog: Dialog) => {
    const currentDialogs = get().dialogs;
    let updatedDialogs;

    if (open) {
      const exists = currentDialogs.some((d: Dialog) => d.key.name === dialog.key.name);
      updatedDialogs = exists ? currentDialogs : [...currentDialogs, dialog];
    } else {
      updatedDialogs = currentDialogs.filter((d : Dialog) => d.key.name !== dialog.key.name);
    }

    set({
      dialogs: updatedDialogs,
    });
  },
  isDialogOpen: (name: DialogType['name']) => {
    return get().dialogs.some((dialog : Dialog) => dialog.key.name === name);
  },
  setAllClosed: () => {
    set({ dialogs: [] });
  },
}));