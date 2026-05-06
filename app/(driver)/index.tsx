import { useCallback, useMemo, useState, useRef } from 'react';
import { Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';

import { setFilter, setSelectedDelivery } from '@/store/deliverySlice';
import { setActiveTripId } from '@/store/authSlice';
import { useDriverDeliveries } from '@/hooks/useDriverDeliveries';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import DeliveryCard from '@/components/ui/custom/DeliveryCard';
import DeliveryBottomSheet from '@/components/ui/custom/DeliveryBottomSheet';

import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery';
import { FILTERS, FILTER_ACTIVE } from '@/constants/utils';

export default function DriverDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const filter = useSelector((s: RootState) => s.deliveries.filter);
  const name = useSelector((s: RootState) => s.auth.name);
  const activeTripId = useSelector((s: RootState) => s.auth.activeTripId);

  const [selectedTrip, setSelectedTrip] = useState<string | undefined>(undefined);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { items, loading, loadMore, resetPage } = useDriverDeliveries(selectedTrip);
  const { items: tripItems } = useDriverDeliveries();

  const trips = useMemo(() =>
    [...new Set(tripItems.map((i: DeliveryItem) => i.tripId))]
      .filter((t): t is string => !!t)
      .sort()
    , [tripItems]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<DeliveryItem>) => (
    <DeliveryCard
      item={item}
      variant="driver"
      onPress={() => {
        dispatch(setSelectedDelivery(item));
        bottomSheetRef.current?.expand();
      }}
    />
  ), [dispatch]);

  const keyExtractor = useCallback((item: DeliveryItem) => item.id, []);

  const handleStartTrip = useCallback((tripId: string) => {
    if (activeTripId && activeTripId !== tripId) {
      Alert.alert('Trip in Progress', 'Finish current trip first.');
      return;
    }
    dispatch(setActiveTripId(tripId));
    router.push('/(driver)/trip');
  }, [activeTripId, dispatch, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-app-bg">
        <VStack className="flex-1 px-4">

          <HStack className="justify-between items-center py-4">
            <VStack>
              <Text className="text-app-text-muted text-xs tracking-widest uppercase">SwiftRoute</Text>
              <Text className="text-app-text-primary text-2xl font-bold">
                Hey, {name?.split(' ')[0]} 👋
              </Text>
            </VStack>
          </HStack>

          <Box className="mb-6">
            <Text className="text-app-text-secondary text-xs font-semibold mb-3 uppercase ml-1">Select Route</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Pressable
                onPress={() => setSelectedTrip(undefined)}
                className={`px-6 py-3 rounded-2xl border ${!selectedTrip ? 'bg-app-brand border-app-brand' : 'bg-app-surface border-app-border'}`}
              >
                <Text className={`font-bold ${!selectedTrip ? 'text-app-text-primary' : 'text-app-text-secondary'}`}>
                  All Routes
                </Text>
              </Pressable>
              {trips.map(t => (
                <Pressable
                  key={t}
                  onPress={() => setSelectedTrip(t)}
                  className={`px-6 py-3 rounded-2xl border ${selectedTrip === t ? 'bg-app-brand border-app-brand' : 'bg-app-surface border-app-border'}`}
                >
                  <Text className={`font-bold ${selectedTrip === t ? 'text-app-text-primary' : 'text-app-text-secondary'}`}>
                    {t?.replace('TRIP-', '#')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Box>

          {selectedTrip && (
            <Pressable
              onPress={() => handleStartTrip(selectedTrip)}
              className="bg-app-success h-14 rounded-2xl flex-row items-center justify-center mb-6 shadow-lg shadow-black/20"
            >
              <Text className="text-app-bg font-black text-lg uppercase tracking-tight">
                Start Route {selectedTrip.replace('TRIP-', '#')}
              </Text>
            </Pressable>
          )}

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
              <ActivityIndicator color="#6366f1" />
            </Box>
          ) : (
            <FlashList<DeliveryItem>
              data={items}
              showsVerticalScrollIndicator={false}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </VStack>

        <DeliveryBottomSheet ref={bottomSheetRef} showStatusUpdate />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}