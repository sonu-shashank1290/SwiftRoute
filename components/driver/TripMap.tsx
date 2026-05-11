import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MapViewClustering from 'react-native-map-clustering';
import { darkMapStyle } from '@/constants/utils';
import type { DeliveryItem } from '@/types/delivery';
import React from 'react';

type Coords = { latitude: number; longitude: number };

type Props = {
    mapRef: React.RefObject<MapView | null>;
    sortedStops: DeliveryItem[];
    routeCoords: Coords[];
    driverLocation: Coords | null;
    markers: React.JSX.Element;
    onRouteReady: (result: any) => void;
};

export default function TripMap({
    mapRef,
    sortedStops,
    routeCoords,
    driverLocation,
    markers,
    onRouteReady,
}: Props) {
    const handleRouteReady = (result: any) => {
        onRouteReady(result);
    };

    return (
        <View style={{ flex: 1 }}>
            <MapViewClustering
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                    latitude: sortedStops[0]?.latitude ?? 12.9716,
                    longitude: sortedStops[0]?.longitude ?? 77.5946,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                customMapStyle={darkMapStyle}
                showsUserLocation
                clusterColor="#6366f1"
                clusterTextColor="#ffffff"
            >
                {markers}

                {routeCoords.length > 1 && (
                    <MapViewDirections
                        origin={routeCoords[0]}
                        destination={routeCoords[routeCoords.length - 1]}
                        waypoints={routeCoords.slice(1, -1)}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
                        strokeWidth={4}
                        strokeColor="#6366f1"
                        mode="DRIVING"
                        onReady={handleRouteReady}
                    />
                )}

                {driverLocation && (
                    <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={{
                            width: 20, height: 20, borderRadius: 10,
                            backgroundColor: '#6366f1',
                            borderWidth: 3, borderColor: '#fff',
                            elevation: 8,
                        }} />
                    </Marker>
                )}
            </MapViewClustering>
        </View>
    );
}