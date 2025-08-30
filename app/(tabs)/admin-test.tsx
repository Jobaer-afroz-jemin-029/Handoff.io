import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export default function AdminTest() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Test Panel</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.infoText}>User Information:</Text>
        <Text style={styles.detailText}>Name: {user?.fullName || 'N/A'}</Text>
        <Text style={styles.detailText}>Email: {user?.email || 'N/A'}</Text>
        <Text style={styles.detailText}>Role: {user?.role || 'N/A'}</Text>
        <Text style={styles.detailText}>Varsity ID: {user?.varsityId || 'N/A'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(tabs)/admin')}
          >
            <Text style={styles.buttonText}>Go to Admin Panel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]}
            onPress={logout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
