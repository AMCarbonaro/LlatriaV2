import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useToastStore } from '@/store/toastStore';
import { Toast } from './Toast';
import { useThemeStore } from '@/store/themeStore';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const { isDark } = useThemeStore();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <View key={toast.id} style={styles.toastWrapper} pointerEvents="box-none">
          <Toast toast={toast} onRemove={removeToast} isDark={isDark} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    zIndex: 1000,
    alignItems: 'flex-end',
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    marginBottom: 8,
    pointerEvents: 'box-none',
  },
});



