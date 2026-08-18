import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Button, Card, Input} from '../../components';
import {useAuth} from '../../store';

const LoginScreen = () => {
  const {login} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert(
      'Missing Information',
      'Please enter your email and password.',
    );
    return;
  }

  try {
    await login(email.trim());
  } catch (error) {
    Alert.alert(
      'Login Error',
      'Unable to complete login. Please try again.',
    );
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>FleetFlow</Text>

          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Sign in to manage your fleet operations
          </Text>
        </View>

        <Card>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Login"
            onPress={handleLogin}
          />
        </Card>

        <Text style={styles.footerText}>
          FleetFlow • Fleet Operations & Logistics
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  footerText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default LoginScreen;