import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../src/constants/theme';
import { Compass } from 'lucide-react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore City</Text>
      </View>
      <View style={styles.content}>
        <Compass color={Colors.textSecondary} size={64} style={{ marginBottom: 20 }} />
        <Text style={styles.text}>Discover points of interest and city data overlays.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  }
});
