import {Writable} from "readable-stream";
import {MemReader, MemWritable, MemWriterOptions} from "./types";

export class ObjectWriter extends Writable implements MemWritable {
  queue: any[];

  constructor(options: MemWriterOptions = {}) {
    options.objectMode = true;
    super(options);
    this.init();
  }

  init() {
    this.queue = [];
  }

  get data() {
    return [...this.queue];
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    if (this.listenerCount('write')) {
      this.emit('write', chunk);
    } else {
      this.queue.push(chunk);
    }
    callback();
  }

  forward<T extends MemReader>(destination: T, options?: { end?: boolean; }): T {
    const forward = (data: Buffer) => destination.push(data);
    this.on('write', forward);

    if (!options || options.end) {
      this.once('finish', () => this.removeListener('data', forward));
    }

    return destination;
  }
}
