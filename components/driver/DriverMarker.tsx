import { Coords } from "@/types/driver/driver";
import { memo } from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";

const DriverMarker = memo(({ coordinate }: { coordinate: Coords }) => (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
        <View className="w-5 h-5 rounded-full bg-app-brand border-2 border-app-text-primary" />
    </Marker>
));

export default DriverMarker;