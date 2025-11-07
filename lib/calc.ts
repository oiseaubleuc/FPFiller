export type ItemIn = {
    description: string;
    qty: number;
    unitPriceEuro: number;
};

export function toCents(items: ItemIn[], vatPercent: number) {
    const subtotalCents = Math.round(
        items.reduce((acc, item) => acc + Math.max(0, item.qty) * Math.max(0, item.unitPriceEuro) * 100, 0)
    );
    const vatCents = Math.round(subtotalCents * (Math.max(0, vatPercent) / 100));
    const totalCents = subtotalCents + vatCents;
    const vatRateBps = Math.round(Math.max(0, vatPercent) * 100);
    return { subtotalCents, vatCents, totalCents, vatRateBps };
}

export function euro(cents: number) {
    return (cents / 100).toFixed(2);
}
