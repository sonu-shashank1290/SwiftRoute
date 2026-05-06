import { memo, useCallback } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import type { DeliveryItem } from '@/types/delivery';
import { setSelectedDelivery } from '@/store/deliverySlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { STATUS_COLORS } from '@/constants/utils';

type Props = {
    item: DeliveryItem;
    variant?: 'user' | 'driver';
    onPress?: () => void;
};


const DeliveryCard = memo(({ item, variant = "user", onPress }: Props) => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const handlePress = useCallback(() => {
        dispatch(setSelectedDelivery(item));
        onPress?.();
    }, [item]);

    return (
        <Pressable
            onPress={handlePress}
        >
            <Box className="bg-app-surface rounded-2xl p-4 mb-3">
                <HStack className="justify-between items-start">
                    <VStack className="flex-1 gap-1 pr-3">
                        <Text className="text-app-text-primary font-bold text-base">
                            {item.trackingId}
                        </Text>
                        <Text className="text-app-text-secondary text-sm">
                            {item.recipient}
                        </Text>
                        <Text className="text-app-text-muted text-xs">
                            {item.address}
                        </Text>
                        {variant === 'driver' && (
                            <HStack className="gap-2 mt-1">
                                <Text className="text-app-brand text-xs">
                                    Stop #{item.sequence}
                                </Text>
                                <Text className="text-app-text-muted text-xs">·</Text>
                                <Text className="text-app-brand text-xs">
                                    {item.tripId}
                                </Text>
                            </HStack>
                        )}
                        {variant === 'user' && item.tripId && (
                            <Text className="text-app-brand text-xs mt-1">
                                {item.tripId}
                            </Text>
                        )}
                    </VStack>

                    <Box className={`${STATUS_COLORS[item.status]} rounded-lg px-3 py-1`}>
                        <Text className="text-app-text-primary text-xs font-bold uppercase">
                            {item.status}
                        </Text>
                    </Box>
                </HStack>
            </Box>
        </Pressable>
    );
});

export default DeliveryCard;