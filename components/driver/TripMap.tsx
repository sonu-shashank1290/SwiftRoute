import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import type { DeliveryItem } from '@/types/delivery/delivery';
import type { Coords } from '@/types/driver/driver';
import { memo, useMemo, useCallback } from 'react';
import { darkMapStyle } from '@/constants/utils';
import React from 'react';
import DriverMarker from './driverMarker';

type Props = {
    mapRef: React.RefObject<MapView | null>;
    sortedStops: DeliveryItem[];
    routeCoords: Coords[];
    driverLocation: Coords | null;
    markers: React.JSX.Element;
    onRouteReady: (result: any) => void;
};

const TripMap = memo(({ mapRef, sortedStops, routeCoords, driverLocation, markers, onRouteReady }: Props) => {
    const handleRouteReady = useCallback((result: any) => {
        onRouteReady(result);
    }, [onRouteReady]);

    const initialRegion = useMemo(() => ({
        latitude: sortedStops[0]?.latitude ?? 12.9716,
        longitude: sortedStops[0]?.longitude ?? 77.5946,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    }), [sortedStops]);

    return (
        <View className="flex-1">
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={initialRegion}
                customMapStyle={darkMapStyle}
                showsUserLocation
            >
                {markers}

                {routeCoords.length > 1 && (
                    <MapViewDirections
                        origin={driverLocation ?? routeCoords[0]}
                        destination={routeCoords[routeCoords.length - 1]}
                        waypoints={routeCoords.slice(0, -1)}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
                        strokeWidth={4}
                        strokeColor="#6366f1"
                        mode="DRIVING"
                        onReady={handleRouteReady}
                        resetOnChange={false}
                    />
                )}

                {driverLocation && <DriverMarker coordinate={driverLocation} />}
            </MapView>
        </View>
    );
});

export default TripMap;