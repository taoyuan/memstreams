import {Duplex, DuplexOptions} from 'readable-stream';
import {
  MemReadable,
  MemReaderOptions,
  MemWritable,
  MemWriterOptions,
} from './types';
import {applyMixins} from './utils';
import {ObjectReader} from './object-reader';
import {ObjectWriter} from './object-writer';

export class ObjectDuplex extends Duplex implements MemReadable, MemWritable {
  readonly data: any[] | Buffer;
  queue: any[] | Buffer[];
  it: Iterator<any>;

  constructor(
    source?: Iterable<any> | Array<any>,
    options: DuplexOptions & MemReaderOptions & MemWriterOptions = {},
  ) {
    options.objectMode = true;
    super(options);

    ObjectReader.prototype.init.call(this, source, options);
    ObjectWriter.prototype.init.call(this);
  }

  forward: <T extends MemReadable>(
    destination: T,
    options?: {end?: boolean},
  ) => T;
}

applyMixins(ObjectDuplex, [ObjectReader, ObjectWriter]);
