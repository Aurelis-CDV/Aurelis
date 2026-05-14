export type ChartDateValuePoint = { date: string; value: number };

export function averageSeriesPointsByDisplayDate(
  points: ReadonlyArray<ChartDateValuePoint>,
): ChartDateValuePoint[] {
  if (points.length === 0) {
    return [];
  }

  type Agg = { sum: number; count: number; order: number };
  const byDate = new Map<string, Agg>();
  let order = 0;

  for (const p of points) {
    const key = p.date;
    if (!Number.isFinite(p.value)) {
      continue;
    }
    const existing = byDate.get(key);
    if (!existing) {
      byDate.set(key, { sum: p.value, count: 1, order: order++ });
    } else {
      existing.sum += p.value;
      existing.count += 1;
    }
  }

  return [...byDate.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([date, agg]) => ({ date, value: agg.sum / agg.count }));
}
