export function nextMinimumBid({ starting_price, bid_increment, currentHighest }) {
  const base = Math.max(currentHighest || 0, starting_price || 0);
  return base + (bid_increment || 1);
}
