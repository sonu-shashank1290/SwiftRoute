import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Box } from '../box';
import { Text } from '../text';
import { HStack } from '../hstack';
import { VStack } from '../vstack';

type Status = 'pending' | 'delivered' | 'failed';

type Props = {
    item: {
        id: string;
        trackingId: string;
        recipient: string;
        address: string;
        status: Status;
        tripId?: string;
    };
};

const STATUS_BG: Record<Status, string> = {
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};

const STATUS_TEXT: Record<Status, string> = {
    pending: 'text-app-warning',
    delivered: 'text-app-success',
    failed: 'text-app-danger',
};

export default function DeliveryCard({ item }: Props) {
    const router = useRouter();

    return (
        <Pressable onPress={() => router.push(`/(user)/delivery/${item.id}`)}>
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
                        <Text className={"text-xs font-bold uppercase"}>
                            {item.status}
                        </Text>
                    </Box>
                </HStack>
            </Box>
        </Pressable>
    );
}