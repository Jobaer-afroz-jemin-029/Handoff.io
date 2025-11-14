import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'https://handoff-backend.onrender.com';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your BUBT email');
      return;
    }

    // Validate BUBT email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+\.)?bubt\.edu\.bd$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid BUBT email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Navigate to verify code screen with email
        router.push({
          pathname: '/auth/verify-code',
          params: { email: email.trim() },
        });
      } else {
        Alert.alert('Error', data.message || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your BUBT email. We'll send you a 6-digit security code to reset your password.
      </Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="yourid@cse.bubt.edu.bd"
        placeholderTextColor="#9ca3af"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Send Code'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f9fafb', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  link: { color: '#1e40af', fontSize: 14, fontWeight: '600' },
});


