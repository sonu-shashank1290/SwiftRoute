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

const STATUS_BG: Record<string, string> = {
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};

type Props = {
    item: DeliveryItem;
    onPress?: () => void;
};


const DeliveryCard = memo(({ item, onPress }: Props) => {
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
                        {item.tripId ? (
                            <Text className="text-app-brand text-xs mt-1">
                                {item.tripId}
                            </Text>
                        ) : null}
                    </VStack>

                    <Box className={`${STATUS_BG[item.status]} rounded-lg px-3 py-1`}>
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