export const now = () => new Date();
export const isActive = (auction) => auction.status === 'active';
export const isScheduled = (auction) => auction.status === 'scheduled';
