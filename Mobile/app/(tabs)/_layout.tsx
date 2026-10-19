import { Tabs } from 'expo-router';
import { Navigation as NavIcon, Camera, AlertTriangle, Compass, User } from 'lucide-react-native';
import { Colors } from '../../src/constants/theme';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        }
      }}>
      <Tabs.Screen
        name="navigate"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ color }) => <NavIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <AlertTriangle color={color} size={24} />,
        }}
      />

      {/* Center Floating Action Button */}
      <Tabs.Screen
        name="report"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.floatingButton}>
              <View style={styles.floatingButtonInner}>
                <Camera color="#FFFFFF" size={26} />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#0F172A',
  }
});
