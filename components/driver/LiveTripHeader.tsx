import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import type { DeliveryItem } from '@/types/delivery/delivery';
import { memo } from 'react';

type Props = {
  activeTripId: string;
  nextStop: DeliveryItem | null;
  stopsLeft: number;
  onSwitch: () => void;
};

const LiveTripHeader = memo(({ activeTripId, nextStop, stopsLeft, onSwitch }: Props) => {
  return (
    <Box className="absolute top-[50px] left-4 right-4 z-10 rounded-2xl p-3" style={{
      backgroundColor: 'rgba(15,15,20,0.90)',
    }}>
      <HStack className="justify-between items-center">
        <VStack>
          <Text className="text-app-text-muted text-xs tracking-widest">LIVE TRIP</Text>
          <Text className="text-app-text-primary text-lg font-bold">
            {activeTripId.slice(0, 12)}
          </Text>
          {nextStop && (
            <Text className="text-app-text-secondary text-xs mt-1">
              Next: Stop #{nextStop.sequence}
            </Text>
          )}
        </VStack>
        <HStack className="gap-2 items-center">
          <Box className="bg-app-success rounded-xl px-3 py-2">
            <Text className="text-app-text-primary text-sm font-bold">
              {stopsLeft} left
            </Text>
          </Box>
          <Pressable onPress={onSwitch} className="bg-app-surface rounded-xl px-3 py-2">
            <Text className="text-app-text-muted text-xs">Switch</Text>
          </Pressable>
        </HStack>
      </HStack>
    </Box>
  );
});

export default LiveTripHeader;