import {Writable} from 'readable-stream';
import {chunk2buf} from './utils';
import {MemReader, MemWriter, MemWriterOptions} from './types';

export class BufferWriter extends Writable implements MemWriter {
  _queue: Buffer[];
  _data: Buffer;

  constructor(options: MemWriterOptions = {}) {
    options.objectMode = false;
    super(options);
    this.init();
  }

  init() {
    this._queue = [];
  }

  get queue() {
    return this._queue;
  }

  get data() {
    if (
      !this._data ||
      this._data.length <
        this._queue.reduce((pre, curr) => pre + curr.length, 0)
    ) {
      this._data = Buffer.concat(this._queue);
    }
    return this._data;
  }

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const data = chunk2buf(chunk, encoding);
    if (this.listenerCount('write')) {
      this.emit('write', data);
    } else {
      this._queue.push(data);
    }
    callback();
  }

  forward<T extends MemReader>(destination: T, options?: {end?: boolean}): T {
    const forward = (data: Buffer) => destination.push(data);
    this.on('write', forward);

    if (!options || options.end) {
      this.once('finish', () => this.removeListener('data', forward));
    }

    return destination;
  }
}
