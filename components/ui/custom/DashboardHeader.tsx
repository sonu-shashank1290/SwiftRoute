import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { logout } from '../../../store/authSlice';
import { HStack } from '../hstack';
import { VStack } from '../vstack';
import { Text } from '../text';
import { Pressable } from '../pressable';
import type { RootState, AppDispatch } from '../../../store';

const DashboardHeader = memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const name = useSelector((s: RootState) => s.auth.name);

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to exit?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    dispatch(logout());
                    router.replace('/login');
                }
            }
        ]);
    };

    return (
        <HStack className="justify-between items-center py-4">
            <VStack>
                <Text className="text-app-text-muted text-xs tracking-widest uppercase">
                    SwiftRoute
                </Text>
                <Text className="text-app-text-primary text-2xl font-bold">
                    Hey, {name?.split(' ')[0] || 'User'} 👋
                </Text>
            </VStack>

            <Pressable
                onPress={handleLogout}
                className="bg-app-surface px-4 py-2 rounded-xl border border-app-border active:opacity-70"
            >
                <Text className="text-app-danger text-xs font-bold uppercase">Logout</Text>
            </Pressable>
        </HStack>
    );
});

export default DashboardHeader;