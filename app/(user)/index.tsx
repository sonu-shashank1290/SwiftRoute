import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Pressable, ActivityIndicator } from 'react-native';
import { setFilter } from '@/store/deliverySlice';
import { useDeliveries } from '@/hooks/useDeliveries';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import DeliveryCard from '@/components/ui/custom/DeliveryCard';
import type { RootState } from '@/store';

const FILTERS = ['all', 'pending', 'delivered', 'failed'] as const;

const FILTER_ACTIVE: Record<string, string> = {
    all: 'bg-app-brand',
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};
type item = {
        id: string;
        trackingId: string;
        recipient: string;
        address: string;
        status: 'pending' | 'delivered' | 'failed';
        tripId?: string;
    };

export default function UserDashboard() {
    const { items, loading } = useDeliveries();
    const filter = useSelector((s: RootState) => s.deliveries.filter);
    const name = useSelector((s: RootState) => s.auth.name);
    const dispatch = useDispatch();

    return (
        <SafeAreaView className="flex-1 bg-app-bg">
            <VStack className="flex-1 px-4">
                
                <HStack className="justify-between items-center py-4">
                    <VStack>
                        <Text className="text-app-text-muted text-xs tracking-widest">SWIFTROUTE</Text>
                        <Text className="text-app-text-primary text-2xl font-bold">
                            Hey, {name?.split(' ')[0]} 👋
                        </Text>
                    </VStack>
                    <Box className="bg-app-surface rounded-2xl px-3 py-2">
                        <Text className="text-app-brand font-semibold">{items.length} orders</Text>
                    </Box>
                </HStack>

                <HStack className="gap-2 mb-4">
                    {FILTERS.map(f => (
                        <Pressable
                            key={f}
                            onPress={() => dispatch(setFilter(f))}
                            className={`flex-1 py-2 rounded-xl items-center ${filter === f ? FILTER_ACTIVE[f] : 'bg-app-surface'}`}
                        >
                            <Text className={`text-xs font-semibold capitalize ${filter === f ? 'text-app-text-primary' : 'text-app-text-muted'}`}>
                                {f}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>

                {loading ? (
                    <Box className="flex-1 justify-center items-center">
                        <ActivityIndicator color="#6366f1" size="large" />
                    </Box>
                ) : (
                    <FlashList
                        data={items}
                        keyExtractor={(item : item) => item.id}
                        renderItem={({ item }) => <DeliveryCard item={item} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

            </VStack>
        </SafeAreaView>
    );
}