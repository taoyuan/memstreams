import {Duplex, Readable, ReadableOptions, Writable, WritableOptions} from "readable-stream";

export type Class<T = {}> = new (...args: any[]) => T;

export interface MemReaderOptions extends ReadableOptions {
}

export interface MemWriterOptions extends WritableOptions {
}

export interface MemReadable {
  it?: Iterator<any>;
}

export interface MemWritable {
  readonly queue: any[] | Buffer[];
  readonly data: any[] | Buffer;
  forward<T extends MemReader>(destination: T, options?: { end?: boolean; }): T;
}

export interface MemReader extends Readable, MemReadable {

}

export interface MemWriter extends Writable, MemWritable {

}

export interface MemDuplex extends Duplex, MemReadable, MemWritable {

}
