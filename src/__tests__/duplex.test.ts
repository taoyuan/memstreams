import {expect, sinon} from '@tib/testlab';
import {Duplex} from 'readable-stream';
import {MemDuplex} from '../types';
import {BufferDuplex} from '../buffer-duplex';
import {ObjectDuplex} from '../object-duplex';

const testReadable = (
  stream: MemDuplex,
  source: Iterable<any> | Array<any>,
  objectMode: boolean,
  cb: () => void,
) => {
  const expectedIt: Iterator<any> = source[Symbol.iterator]();

  const tester = objectMode
    ? (data: any) => expect(data).equal(expectedIt.next().value)
    : (data: any) =>
        expect(data).deepEqual(Buffer.from([expectedIt.next().value]));

  stream.on('data', tester);
  stream.on('end', cb);
};

const testWritable = (
  stream: MemDuplex,
  data: any,
  objectMode: boolean,
  done: () => void,
) => {
  const spy = sinon.spy();

  for (let i = 0; i < data.length; i++) {
    stream.write(
      typeof data == 'string' ? Buffer.from(data.charAt(i)) : data[i],
      spy,
    );
  }
  stream.end();

  stream.on('finish', () => {
    expect(spy.callCount).equal(data.length);
    const res = stream.data;
    if (res instanceof Buffer) {
      expect(res.toString()).equal(data);
    } else {
      expect(res).deepEqual(data);
    }
    done();
  });
};

const cbWhenCount = (count: number, done: () => void) => {
  let current = 0;
  return () => {
    current++;
    if (current >= count) done();
  };
};

describe('Duplex', function () {
  it('should initiate', function () {
    expect(new BufferDuplex()).instanceOf(Duplex);
    expect(new ObjectDuplex()).instanceOf(Duplex);
  });

  describe('Half-duplex writable', function () {
    it('should work with array as source (ObjectDuplex)', function (done) {
      const data = [1, 2, 3, 4, 5];
      const duplex = new ObjectDuplex([], {
        writableObjectMode: true,
      });

      testWritable(duplex, data, true, done);
    });

    it('should work with array as source (BufferDuplex)', function (done) {
      const data = "I'm a proud string";
      const duplex = new BufferDuplex([]);

      testWritable(duplex, data, false, done);
    });
  });

  describe('Full-duplex unlinked', function () {
    it('should work (ObjectDuplex)', function (done) {
      const source = [1, 2, 3, 4, 5];
      const data = [1, 2, 3, 4, 5];
      const duplex = new ObjectDuplex(source);
      const doneCb = cbWhenCount(2, done);

      testReadable(duplex, source, true, doneCb);
      testWritable(duplex, data, true, doneCb);
    });

    it('should work (BufferDuplex)', function (done) {
      const source = Buffer.from('test');
      const data = "I'm a proud string";
      const duplex = new BufferDuplex(source);
      const doneCb = cbWhenCount(2, done);

      testReadable(duplex, source, false, doneCb);
      testWritable(duplex, data, false, doneCb);
    });
  });

  describe('Full-duplex linked', function () {
    it('should work (ObjectDuplex)', function (done) {
      const data = [1, 2, 3, 4, 5];
      const duplex = new ObjectDuplex();

      duplex.forward(duplex);

      const read = () => {
        data.forEach(d => expect(duplex.read()).deepEqual(d));
        expect(duplex.read()).null();
        done();
      };
      const writeCb = cbWhenCount(data.length, read);
      data.forEach(d =>
        duplex.write(d, err => {
          expect(err).undefined();
          writeCb();
        }),
      );
    });

    it('should work (Buffer Duplex)', function (done) {
      const data = Array.from("I'm a proud string");
      const duplex = new BufferDuplex(undefined);

      duplex.forward(duplex);

      const read = () => {
        expect(duplex.read()).deepEqual(Buffer.from(data.join('')));
        expect(duplex.read()).null();
        done();
      };
      const writeCb = cbWhenCount(data.length, read);
      data.forEach(d =>
        duplex.write(d, err => {
          expect(err).undefined();
          writeCb();
        }),
      );
    });
  });

  describe('pipe', function () {
    it('should pipe each other', function (done) {
      const d1data = Buffer.from('From D1');
      const d2data = Buffer.from('From D2');

      const d1 = new BufferDuplex();
      const d2 = new BufferDuplex();

      const cb = cbWhenCount(2, done);

      d1.forward(d2).forward(d1);

      d1.on('data', data => {
        expect(d1.queue).empty();
        expect(data).deepEqual(d2data);
        cb();
      });

      d2.on('data', data => {
        expect(d2.queue).empty();
        expect(data).deepEqual(d1data);
        cb();
      });

      d1.write(d1data);
      d2.write(d2data);
    });
  });
});
