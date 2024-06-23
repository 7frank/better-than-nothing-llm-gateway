export interface Weighted<T> {
  /** The item's weight (non-decimal) */
  weight: number;
  /** The array item */
  item: T;
}

export type Getter<T> = () => T;

export function wrr<T>(arr: Weighted<T>[]): Getter<T> {
  var i = 0,
    j = 0,
    tmp,
    items: T[] = [];

  for (; i < arr.length; i++) {
    tmp = arr[i];
    for (j = 0; j < tmp.weight; j++) {
      items.push(tmp.item);
    }
  }

  return function () {
    return items[(items.length * Math.random()) | 0];
  };
}
