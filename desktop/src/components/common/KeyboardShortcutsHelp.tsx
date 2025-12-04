import React from 'react';
import { Modal } from './Modal';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface KeyboardShortcut {
  keys: string[];
  description: string;
}

const shortcuts: KeyboardShortcut[] = [
  { keys: ['⌘', 'N'], description: 'Create new listing' },
  { keys: ['⌘', 'S'], description: 'Save changes' },
  { keys: ['⌘', 'K'], description: 'Quick search' },
  { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal/dialog' },
];

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const formatKey = (key: string): string => {
  if (key === '⌘') {
    return isMac ? '⌘' : 'Ctrl';
  }
  return key;
};

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <span className="text-sm text-foreground">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                        {formatKey(key)}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="text-muted-foreground mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
};



