export const FILTERS = ['all', 'pending', 'delivered', 'failed'] as const;

export const FILTER_ACTIVE: Record<string, string> = {
    all: 'bg-app-brand',
    pending: 'bg-app-warning',
    delivered: 'bg-app-success',
    failed: 'bg-app-danger',
};