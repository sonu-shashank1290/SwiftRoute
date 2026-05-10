export interface User {
    id: string;
    name: string;
    email: string;
    address: string;
    latitude: number;
    longitude: number;
    role: 'user' | 'driver';
}