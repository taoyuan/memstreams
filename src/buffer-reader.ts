import {Readable} from 'readable-stream';
import {any2buf} from "./utils";
import {MemReadable, MemReaderOptions} from "./types";

export class BufferReader extends Readable implements MemReadable {

  it?: Iterator<any>;

  constructor(source?: Iterable<any> | ArrayLike<any>, options: MemReaderOptions = {}) {
    options.objectMode = false;
    super(options);
    this.init(source, options);
  }

  init(source?: Iterable<any> | ArrayLike<any>, options: MemReaderOptions = {}) {
    this.it = source && source[Symbol.iterator]();
  }

  _read() {
    if (this.it) {
      const next = this.it.next();
      if (next.done) {
        this.push(null);
      } else {
        return this.push(any2buf(next.value, <BufferEncoding>this._readableState.encoding || 'utf8'));
      }
    }
  }
}
