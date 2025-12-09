import { Tabs } from 'expo-router';
import { Home, Map as MapIcon, Camera, Activity, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#94a3b8',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="iirs"
        options={{
          title: 'IIRS',
          tabBarIcon: ({ color }) => <Camera size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
