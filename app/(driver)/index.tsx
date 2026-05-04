import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export default function DriverDashboard() {
    return (
        <SafeAreaView className="flex-1 bg-app-bg justify-center items-center">
            <Text className="text-app-text-muted">Driver dashboard</Text>
        </SafeAreaView>
    );
}