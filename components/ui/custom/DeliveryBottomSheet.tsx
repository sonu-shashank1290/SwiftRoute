import { forwardRef, useCallback } from 'react';
import { Pressable } from '../pressable';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { database } from '../../../services/storage/database';
import { DeliveryItem as DeliveryModel } from '../../../services/storage/models/DeliveryItem';
import { updateStatus, setSelectedDelivery } from '../../../store/deliverySlice';
import { Box } from '../box';
import { Text } from '../text';
import { HStack } from '../hstack';
import { VStack } from '../vstack';
import type { AppDispatch, RootState } from '../../../store';
import type { Status } from '../../../types/delivery';

const STATUSES: Status[] = ['pending', 'delivered', 'failed'];

const STATUS_BG: Record<Status, string> = {
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};

const STATUS_ACTIVE: Record<Status, string> = {
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};

type Props = {
    showStatusUpdate?: boolean;
};

const DeliveryBottomSheet = forwardRef<BottomSheet, Props>(
    ({ showStatusUpdate = false }, ref) => {
        const dispatch = useDispatch<AppDispatch>();
        const item = useSelector((s: RootState) => s.deliveries.selectedDelivery);

        const handleStatusChange = useCallback(async (status: Status): Promise<void> => {
            if (!item) return;
            await database.write(async () => {
                const record = await database
                    .get<DeliveryModel>('delivery_items')
                    .find(item.id);
                await record.update(r => { r.status = status; });
            });
            dispatch(updateStatus({ id: item.id, status }));
        }, [item]);

        const handleClose = useCallback((): void => {
            dispatch(setSelectedDelivery(null));
        }, []);

        if (!item) return null;

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                enablePanDownToClose
                onClose={handleClose}
                backgroundStyle={{ backgroundColor: '#1e1e2e' }}
                handleIndicatorStyle={{ backgroundColor: '#52525b' }}
            >
                <BottomSheetView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}>

                    {/* Header */}
                    <HStack className="justify-between items-center mb-4">
                        <VStack>
                            <Text className="text-app-text-muted text-xs tracking-widest">TRACKING</Text>
                            <Text className="text-app-text-primary text-xl font-bold">
                                {item.trackingId}
                            </Text>
                        </VStack>
                        <Box className={`${STATUS_BG[item.status as Status]} rounded-lg px-3 py-1`}>
                            <Text className="text-app-text-primary text-xs font-bold uppercase">
                                {item.status}
                            </Text>
                        </Box>
                    </HStack>

                    {/* Info */}
                    <Box className="bg-app-bg rounded-2xl p-4 mb-4">
                        {[
                            { label: 'Recipient', value: item.recipient },
                            { label: 'Address', value: item.address },
                            { label: 'Trip', value: item.tripId },
                            { label: 'Stop', value: `#${item.sequence}` },
                        ].map(({ label, value }) => (
                            <HStack key={label} className="justify-between py-2 border-b border-app-border">
                                <Text className="text-app-text-muted text-sm">{label}</Text>
                                <Text className="text-app-text-primary text-sm font-semibold max-w-[60%] text-right">
                                    {value}
                                </Text>
                            </HStack>
                        ))}
                    </Box>
                    {showStatusUpdate && (
                        <>
                            <Text className="text-app-text-muted text-xs tracking-widest mb-3">
                                UPDATE STATUS
                            </Text>
                            <HStack className="gap-2">
                                {STATUSES.map(s => (
                                    <Pressable
                                        key={s}
                                        onPress={() => handleStatusChange(s)}
                                        className={`flex-1 py-3 rounded-xl items-center border border-app-border
                      ${item.status === s ? STATUS_ACTIVE[s] : 'bg-app-bg'}`}
                                    >
                                        <Text className={`text-xs font-bold capitalize
                      ${item.status === s ? 'text-app-text-primary' : 'text-app-text-muted'}`}>
                                            {s}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>
                        </>
                    )}

                </BottomSheetView>
            </BottomSheet>
        );
    }
);

export default DeliveryBottomSheet;