import {Duplex, DuplexOptions} from "readable-stream";
import {MemReadable, MemReaderOptions, MemWritable, MemWriterOptions} from "./types";
import {BufferReader} from "./buffer-reader";
import {BufferWriter} from "./buffer-writer";
import {applyMixins} from "./utils";

export class BufferDuplex extends Duplex implements MemReadable, MemWritable {
  readonly data: any[] | Buffer;
  queue: any[] | Buffer[];
  it: Iterator<any>;

  constructor(
    source?: Iterable<any> | ArrayLike<any>,
    options: DuplexOptions & MemReaderOptions & MemWriterOptions = {}
  ) {
    options.objectMode = false;
    super(options);

    BufferReader.prototype.init.call(this, source, options);
    BufferWriter.prototype.init.call(this, options);
  }

  forward: <T extends MemReadable>(destination: T, options?: { end?: boolean }) => T;
}

applyMixins(BufferDuplex, [BufferReader, BufferWriter]);
