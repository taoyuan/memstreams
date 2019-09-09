import {Class} from "./types";

export function any2buf(value: any, encoding: BufferEncoding) {
  return Number.isInteger(value) ? Buffer.from([value]) : Buffer.from(value, encoding);
}

export function chunk2buf(chunk: Buffer | string, encoding?: BufferEncoding) {
  return typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk;
}

export function applyMixins(derive: Class<any>, bases: Class<any>[]) {
  bases.forEach(base => {
    Object.getOwnPropertyNames(base.prototype).forEach(name => {
      Object.defineProperty(
        derive.prototype,
        name,
        Object.getOwnPropertyDescriptor(base.prototype, name)!
      );
    });
  });
}
