export interface Rng {
  next(): number;
  nextInt(maxExclusive: number): number;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  return {
    next(): number {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(maxExclusive: number): number {
      if (maxExclusive <= 0) {
        return 0;
      }

      return Math.floor(this.next() * maxExclusive);
    }
  };
}

export function shuffleInPlace<T>(items: T[], rng: Rng): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapWith = rng.nextInt(index + 1);
    [items[index], items[swapWith]] = [items[swapWith], items[index]];
  }
}

