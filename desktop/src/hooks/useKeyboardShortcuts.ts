import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? event.metaKey : event.ctrlKey;
        
        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (shortcut.ctrlKey !== undefined ? event.ctrlKey === shortcut.ctrlKey : true) &&
          (shortcut.metaKey !== undefined ? event.metaKey === shortcut.metaKey : true) &&
          (shortcut.shiftKey !== undefined ? event.shiftKey === shortcut.shiftKey : true) &&
          (shortcut.altKey !== undefined ? event.altKey === shortcut.altKey : true) &&
          (!shortcut.ctrlKey && !shortcut.metaKey ? !modifierKey : true);

        if (matches) {
          event.preventDefault();
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};






