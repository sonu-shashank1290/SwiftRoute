import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Status = 'pending' | 'delivered' | 'failed';

type DeliveryItem = {
    id: string;
    trackingId: string;
    recipient: string;
    address: string;
    status: Status;
    latitude: number;
    longitude: number;
    sequence?: number;
    tripId?: string;
    userId: string;
};

type State = {
    items: DeliveryItem[];
    filter: 'all' | Status;
    loading: boolean;
}

const initialState: State = {
    items: [],
    filter: 'all',
    loading: false,
};

const deliverySlice = createSlice({
    name: 'deliveries',
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<DeliveryItem[]>) {
            state.items = action.payload;
        },
        setFilter(state, action: PayloadAction<State['filter']>) {
            state.filter = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        updateStatus(state, action: PayloadAction<{ id: string; status: Status }>) {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) item.status = action.payload.status;
        }
    }
});

export const { setItems, setFilter, setLoading, updateStatus } = deliverySlice.actions;

export default deliverySlice.reducer;