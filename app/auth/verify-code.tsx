import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_BASE_URL = 'https://handoff-backend.onrender.com';

export default function VerifyCode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const type = params.type as string; // 'registration' or 'password-reset'
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Handle paste
      const pastedCode = numericText.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      // Focus last filled input
      const lastIndex = Math.min(index + pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);
      
      // Auto-focus next input
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    try {
      // Check if this is registration verification or password reset
      if (type === 'registration') {
        // Registration verification
        const res = await fetch(`${API_BASE_URL}/api/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: fullCode }),
        });

        const data = await res.json();

        if (res.ok && data.verified) {
          Alert.alert('Success', 'Email verified successfully! You can now login.', [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]);
        } else {
          Alert.alert('Error', data.message || 'Invalid or expired code. Please try again.');
          // Clear code on error
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        // Password reset verification
        const res = await fetch(`${API_BASE_URL}/api/password/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: fullCode }),
        });

        const data = await res.json();

        if (res.ok && data.verified) {
          // Navigate to reset password screen
          router.push({
            pathname: '/auth/reset-password',
            params: { email, code: fullCode },
          });
        } else {
          Alert.alert('Error', data.message || 'Invalid or expired code. Please try again.');
          // Clear code on error
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (e: any) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.subtitle}>Email is missing. Please go back and try again.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Security Code</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={styles.email}>{email}</Text>
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.codeInput, digit && styles.codeInputFilled]}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, verifying && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={verifying || code.join('').length !== 6}
      >
        <Text style={styles.buttonText}>
          {verifying ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.linkBtn}
      >
        <Text style={styles.link}>Change Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 20,
  },
  email: {
    fontWeight: '600',
    color: '#1e40af',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  codeInputFilled: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  button: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkBtn: {
    alignItems: 'center',
  },
  link: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
  },
});

