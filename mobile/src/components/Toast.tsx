import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { Toast as ToastType } from '@/store/toastStore';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
  isDark: boolean;
}

const iconComponents = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove, isDark }) => {
  const Icon = iconComponents[toast.type];

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onRemove]);

  const getToastStyles = () => {
    if (isDark) {
      switch (toast.type) {
        case 'success':
          return { bg: '#14532d', border: '#22c55e', text: '#86efac', icon: '#86efac' };
        case 'error':
          return { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5', icon: '#fca5a5' };
        case 'warning':
          return { bg: '#78350f', border: '#fbbf24', text: '#fcd34d', icon: '#fcd34d' };
        case 'info':
          return { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd', icon: '#93c5fd' };
      }
    } else {
      switch (toast.type) {
        case 'success':
          return { bg: '#dcfce7', border: '#22c55e', text: '#166534', icon: '#166534' };
        case 'error':
          return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#991b1b' };
        case 'warning':
          return { bg: '#fef3c7', border: '#fbbf24', text: '#92400e', icon: '#92400e' };
        case 'info':
          return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', icon: '#1e40af' };
      }
    }
  };

  const styles = getToastStyles();

  return (
    <View
      style={[
        toastStyles.container,
        {
          backgroundColor: styles.bg,
          borderColor: styles.border,
        },
      ]}
    >
      <Icon size={20} color={styles.icon} style={toastStyles.icon} />
      <Text style={[toastStyles.message, { color: styles.text }]}>{toast.message}</Text>
      <TouchableOpacity
        onPress={() => onRemove(toast.id)}
        style={toastStyles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={16} color={styles.text} />
      </TouchableOpacity>
    </View>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 280,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});



