import { useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator } from 'react-native';
import { setFilter } from '@/store/deliverySlice';
import { useDeliveries } from '@/hooks/useDeliveries';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import DeliveryCard from '@/components/ui/custom/DeliveryCard';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery';
import DeliveryBottomSheet from '@/components/ui/custom/DeliveryBottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FILTERS, FILTER_ACTIVE } from '@/constants/utils';
import DashboardHeader from '@/components/ui/custom/DashboardHeader';

export default function UserDashboard() {
    const { items, resetPage, loading, loadMore } = useDeliveries();
    const { filter } = useSelector((s: RootState) => s.deliveries);
    const dispatch = useDispatch<AppDispatch>();

    const bottomSheetRef = useRef<BottomSheet>(null);

    const renderItem = useCallback(({ item, index }: { item: DeliveryItem; index: number }) => (
        <DeliveryCard item={item} onPress={() => bottomSheetRef.current?.expand()} />
    ), []);

    const keyExtractor = useCallback((item: DeliveryItem) => item.id, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-app-bg">
                <VStack className="flex-1 px-4">
                    <DashboardHeader />
                    <HStack className="gap-2 mb-4">
                        {FILTERS.map(f => (
                            <Pressable
                                key={f}
                                onPress={() => {
                                    resetPage();
                                    dispatch(setFilter(f));
                                }}
                                className={`flex-1 py-2 rounded-xl items-center ${filter === f ? FILTER_ACTIVE[f] : 'bg-app-surface'}`}
                            >
                                <Text className={`text-xs font-semibold capitalize ${filter === f ? 'text-app-text-primary' : 'text-app-text-muted'}`}>
                                    {f}
                                </Text>
                            </Pressable>
                        ))}
                    </HStack>
                    {loading && items.length === 0 ? (
                        <Box className="flex-1 justify-center items-center">
                            <ActivityIndicator color="#6366f1" size="large" />
                        </Box>
                    ) : (
                        <FlashList<DeliveryItem>
                            data={items}
                            extraData={filter}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                            onEndReached={loadMore}
                            onEndReachedThreshold={0.5}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}

                </VStack>
                <DeliveryBottomSheet ref={bottomSheetRef} />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}