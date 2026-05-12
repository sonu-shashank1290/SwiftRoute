import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { memo } from 'react';

type Props = {
  onEndTrip: () => void;
};
const TripControls = memo(({ onEndTrip }: Props) => {
  return (
    <Box className="absolute bottom-5 left-4 right-4 z-10">
      <Pressable
        onPress={onEndTrip}
        className="bg-app-danger rounded-xl py-4 items-center"
      >
        <Text className="text-app-text-primary font-bold text-base">End Trip</Text>
      </Pressable>
    </Box>
  );
}
);
export default TripControls;