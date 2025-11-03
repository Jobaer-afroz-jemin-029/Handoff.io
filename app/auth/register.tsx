import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import Logo from '../components/Logo';

export default function Register() {
  const [formData, setFormData] = useState({
    varsityId: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuthStore();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { varsityId, fullName, email, password } = formData;

    if (!varsityId.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    // Updated regex to only allow BUBT department emails (e.g., @cse.bubt.edu.bd, @eee.bubt.edu.bd, etc.)
 const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+\.)?bubt\.edu\.bd$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid BUBT email address (e.g., username@cse.bubt.edu.bd)');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const { varsityId, fullName, email, phoneNumber, password } = formData;

    const user = {
      varsityId,
      fullName,
      email,
      password,
      phoneNumber,
    };

    try {
      const success = await register(user);
      
      if (success) {
        console.log('Registration successful');
        Alert.alert('Success', 'Registration successful! Please check your email for verification.');
        
        // Clear the form
        setFormData({
          varsityId: '',
          fullName: '',
          email: '',
          phoneNumber: '',
          password: '',
        });

        router.replace('/auth/login');
      } else {
        Alert.alert('Registration Error', 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.log('Registration error:', error);
      Alert.alert('Registration Error', 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
            <Logo style={{marginLeft:70,marginBottom:30}}/>

          <View style={styles.form}>
            <Text style={styles.label}>Varsity ID</Text>
            <TextInput
              style={styles.input}
              value={formData.varsityId}
              onChangeText={value => handleInputChange('varsityId', value)}
              placeholder="Enter your varsity ID"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={value => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              placeholder="Enter your BUBT email (e.g., username@cse.bubt.edu.bd)"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={value => handleInputChange('phoneNumber', value)}
              placeholder="Enter your phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={value => handleInputChange('password', value)}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Register'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/auth/login')}
              style={{ alignSelf: 'center', marginTop: 10 }}
            >
              <Text style={{ fontSize: 16, color: 'grey' }}>
                Already have an account? <Text style={{ color: '#1e40af' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flexGrow: 1, padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#6b7280' },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.6 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
