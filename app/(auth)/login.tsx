import { useState } from 'react';
import { TextInput, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { login } from '@/store/authSlice';
import { MOCK_USERS } from '@/constants/utils';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { AppDispatch } from '@/store';
import type { Role } from '@/types/user/user';


export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const found = MOCK_USERS.find(
      u => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (!found) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    dispatch(login({ id: found.id, name: found.name, email: found.email, role: found.role as Role }));
  };

  return (
    <SafeAreaView className="flex-1 bg-app-bg justify-center px-6">
      <VStack space="lg">

        <VStack space="xs">
          <Text className="text-app-text-muted text-xs tracking-widest">SWIFTROUTE</Text>
          <Text className="text-app-text-primary text-3xl font-bold">Sign In</Text>
        </VStack>

        <VStack space="sm">
          <Text className="text-app-text-secondary text-sm">Email</Text>
          <Input className="bg-app-surface rounded-xl border-0">
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="user@test.com"
              placeholderTextColor="#52525b"
              autoCapitalize="none"
              keyboardType="email-address"
              className="text-app-text-primary text-sm"
            />
          </Input>
        </VStack>

        <VStack space="sm">
          <Text className="text-app-text-secondary text-sm">Password</Text>
          <Input className="bg-app-surface rounded-xl border-0">
            <InputField
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              placeholderTextColor="#52525b"
              secureTextEntry
              className="text-app-text-primary text-sm"
            />
          </Input>
        </VStack>

        {error ? <Text className="text-app-danger text-sm">{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="bg-app-brand rounded-xl py-4 items-center"
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-app-text-primary font-semibold text-base">Continue</Text>
          }
        </Pressable>

      </VStack>
    </SafeAreaView>
  );
}