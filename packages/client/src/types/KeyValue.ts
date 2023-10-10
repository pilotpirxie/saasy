export type KeyValue<K extends keyof any, V> = {
  [P in K]: V;
}