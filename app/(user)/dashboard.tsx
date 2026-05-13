import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useDashboardStore } from '@/store/dashboardStore';
import TabBar from '@/components/dashboard/Tabbar';
import UsersTab from '@/components/dashboard/UsersTab';
import PostsTab from '@/components/dashboard/PostsTab';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function DashboardScreen() {
  const { activeTab, setActiveTab, selectedUser } = useDashboardStore();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="flex-1 bg-app-bg">
        <View className="flex-1 px-4 pt-4">
          <Text className="text-app-text-primary text-2xl font-bold mb-1">Dashboard</Text>
          <Text className="text-app-text-muted text-xs mb-4">
            {selectedUser ? `Filtered by ${selectedUser.name}` : 'All data'}
          </Text>

          <TabBar active={activeTab} onPress={setActiveTab} />

          {activeTab === 'users' ? <UsersTab /> : <PostsTab />}
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}