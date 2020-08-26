import {Readable} from 'readable-stream';
import {MemReadable, MemReaderOptions} from './types';

export class ObjectReader extends Readable implements MemReadable {
  it?: Iterator<any>;

  constructor(
    source?: Iterable<any> | Array<any>,
    options: MemReaderOptions = {},
  ) {
    options.objectMode = true;
    super(options);
    this.init(source, options);
  }

  init(source?: Iterable<any> | Array<any>, options: MemReaderOptions = {}) {
    this.it = source?.[Symbol.iterator]();
  }

  _read() {
    if (this.it) {
      const next = this.it.next();
      if (next.done) {
        this.push(null);
      } else {
        return this.push(next.value);
      }
    }
  }
}
