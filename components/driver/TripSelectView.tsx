import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import TripPickerModal from './TripPickerModal';
import type { Trip } from '@/types/driver/driver';
import { memo } from 'react';

type Props = {
  loading: boolean;
  showPicker: boolean;
  trips: Trip[];
  onSelect: (tripId: string) => void;
  onClose: () => void;
};

const TripSelectView = memo(({ loading, showPicker, trips, onSelect, onClose }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-app-bg justify-center items-center">
      <TripPickerModal
        visible={showPicker}
        trips={trips}
        onSelect={onSelect}
        onClose={onClose}
      />
      {!showPicker && (
        <Box className="items-center">
          {loading ? (
            <Spinner size="large" />
          ) : (
            <Text className="text-app-text-muted">No active trips available</Text>
          )}
        </Box>
      )}
    </SafeAreaView>
  );
})
export default TripSelectView;