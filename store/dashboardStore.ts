import { create } from 'zustand';
import type { User } from '@/services/users/types';

type Tab = 'users' | 'posts';

type DashboardStore = {
  activeTab: Tab;
  selectedUser: User | null;
  setActiveTab: (tab: Tab) => void;
  setSelectedUser: (user: User | null) => void;
};

export const useDashboardStore = create<DashboardStore>(set => ({
  activeTab: 'users',
  selectedUser: null,
  setActiveTab: tab => set({ activeTab: tab }),
  setSelectedUser: user => set({ selectedUser: user }),
}));