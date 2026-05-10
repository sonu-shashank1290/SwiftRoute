import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function UserLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0f0f14', borderTopColor: '#2a2a3e' },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#52525b',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}