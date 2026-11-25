import type { Microcycle } from '@/types';

// S3 seam; persistence and date lookup land in RB-02.
export async function getCurrentMicrocycle(
  _planId: string,
  _date: string
): Promise<Microcycle | null> {
  throw new Error('Not implemented');
}
