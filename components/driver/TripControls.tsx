import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';

type Props = {
  onEndTrip: () => void;
};

export default function TripControls({ onEndTrip }: Props) {
  return (
    <Box style={{
      position: 'absolute', bottom: 20,
      left: 16, right: 16, zIndex: 1
    }}>
      <Pressable
        onPress={onEndTrip}
        className="bg-app-danger rounded-xl py-4 items-center"
      >
        <Text className="text-app-text-primary font-bold text-base">End Trip</Text>
      </Pressable>
    </Box>
  );
}