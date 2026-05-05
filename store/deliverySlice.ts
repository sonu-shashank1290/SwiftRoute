import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { DeliveryItem, Status } from '@/types/delivery';

type deliveryState = {
    items: DeliveryItem[];
    filter: 'all' | Status;
    loading: boolean;
    selectedDelivery: DeliveryItem | null;
}

const initialState: deliveryState = {
    items: [],
    filter: 'all',
    loading: false,
    selectedDelivery: null,
};

const deliverySlice = createSlice({
    name: 'deliveries',
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<DeliveryItem[]>) {
            state.items = action.payload;
        },
        setFilter(state, action: PayloadAction<deliveryState['filter']>) {
            state.filter = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setSelectedDelivery(state, action: PayloadAction<DeliveryItem | null>) {
            state.selectedDelivery = action.payload;
        },
        updateStatus(state, action: PayloadAction<{ id: string; status: Status }>) {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) item.status = action.payload.status;
            if (state.selectedDelivery?.id === action.payload.id) {
                state.selectedDelivery.status = action.payload.status;
            }
        }
    }
});

export const { setItems, setFilter, setLoading, setSelectedDelivery, updateStatus } = deliverySlice.actions;

export default deliverySlice.reducer;