import { create } from 'zustand';
import { AdminOrder } from '@/types';

export interface RealtimeNotification {
  id: string;
  type: 'INSERT' | 'UPDATE';
  table: string;
  orderNumber?: string;
  status?: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface AdminState {
  // === Live Orders ===
  liveOrders: AdminOrder[];
  setLiveOrders: (orders: AdminOrder[]) => void;
  appendLiveOrder: (order: AdminOrder) => void;
  updateLiveOrder: (orderId: string, patch: Partial<AdminOrder>) => void;

  // === Notifications ===
  notifications: RealtimeNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // === Live Orders ===
  liveOrders: [],

  setLiveOrders: (orders) => set({ liveOrders: orders }),

  appendLiveOrder: (order) =>
    set((state) => ({
      liveOrders: [order, ...state.liveOrders],
    })),

  updateLiveOrder: (orderId, patch) =>
    set((state) => ({
      liveOrders: state.liveOrders.map((o) =>
        o.id === orderId ? { ...o, ...patch } : o
      ),
    })),

  // === Notifications ===
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => {
      const newNotification: RealtimeNotification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
        isRead: false,
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 50), // keep last 50
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0 }),
}));
