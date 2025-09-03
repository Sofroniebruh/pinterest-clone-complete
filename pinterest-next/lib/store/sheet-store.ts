import { createStore } from 'zustand/vanilla';

type SheetType = {
  name: 'header sheet' | 'settings sheet' | 'search sheet'
}

export interface Sheet {
  key: SheetType;
  value: boolean;
}

interface SheetStore {
  sheets: Sheet[];
  isSheetOpen: (name: SheetType['name']) => boolean;
  setIsSheetOpen: (isOpen: boolean, sheet: Sheet) => void;
  setAllSheetsClosed: () => void;
}

export const sheetStore = createStore<SheetStore>((set, get) => ({
  sheets: [],
  setIsSheetOpen: (open: boolean, sheet: Sheet) => {
    const currentSheets = get().sheets;
    let updatedSheets;

    if (open) {
      const exists = currentSheets.some((s : Sheet) => s.key.name === sheet.key.name);
      updatedSheets = exists ? currentSheets : [...currentSheets, sheet];
    } else {
      updatedSheets = currentSheets.filter((s : Sheet) => s.key.name !== sheet.key.name);
    }

    set({
      sheets: updatedSheets,
    });
  },
  isSheetOpen: (name: SheetType['name']) => {
    return get().sheets.some((sheet : Sheet) => sheet.key.name === name);
  },
  setAllSheetsClosed: () => {
    set({ sheets: [] });
  },
}));