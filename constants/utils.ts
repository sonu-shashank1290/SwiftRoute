export const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#0f0f14' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f14' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1e2e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a10' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
];

export const MOCK_USERS = [
  {
    id: "USER-001",
    name: 'Arjun Sharma',
    email: 'arjun@example.in',
    address: '14 MG Road, Bengaluru 560001',
    role: 'user',
    password: "123456",
  },
  {
    id: "USER-002",
    name: 'Priya Nair',
    email: 'priya@example.in',
    address: '7 Koramangala 5th Block, Bengaluru 560095',
    role: 'user',
    password: "123456",
  },
  {
    id: "DRV-001",
    name: 'Vikram Dass',
    email: 'vikram@swiftroute.in',
    role: 'driver',
    password: "123456",
  }

];