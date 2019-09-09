import {assert} from 'chai';
import sinon = require("sinon");

import {BufferDuplex} from "../buffer-duplex";
import {MemDuplex} from "../types";
import {Duplex} from "readable-stream";
import {ObjectDuplex} from "../object-duplex";


const testReadable = (
  stream: MemDuplex,
  source: Iterable<any> | ArrayLike<any>,
  objectMode: boolean,
  cb: () => void
) => {
  const expectedIt = source[Symbol.iterator]();

  const tester = objectMode
    ? data => assert.equal(data, expectedIt.next().value)
    : data => assert.deepEqual(data, Buffer.from([expectedIt.next().value]));

  stream.on('data', tester);
  stream.on('end', cb);
};

const testWritable = (
  stream: MemDuplex,
  data: any,
  objectMode: boolean,
  done: () => void
) => {
  const spy = sinon.spy();

  for (let i = 0; i < data.length; i++) {
    stream.write(
      typeof data == 'string'
        ? Buffer.from(data.charAt(i))
        : data[i],
      spy
    );
  }
  stream.end();

  stream.on('finish', () => {
    assert.equal(spy.callCount, data.length);
    const res = stream.data;
    if (res instanceof Buffer) {
      assert.equal(res.toString(), data);
    } else {
      assert.deepEqual(res, data);
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
    assert.instanceOf(new BufferDuplex(), Duplex);
    assert.instanceOf(new ObjectDuplex(), Duplex);
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
        data.forEach(d => assert.deepEqual(duplex.read(), d));
        assert.isNull(duplex.read());
        done();
      };
      const writeCb = cbWhenCount(data.length, read);
      data.forEach(d =>
        duplex.write(d, err => {
          assert.isUndefined(err);
          writeCb();
        })
      );
    });

    it('should work (Buffer Duplex)', function (done) {
      const data = Array.from("I'm a proud string");
      const duplex = new BufferDuplex(undefined);

      duplex.forward(duplex);

      const read = () => {
        assert.deepEqual(duplex.read(), Buffer.from(data.join('')));
        assert.isNull(duplex.read());
        done();
      };
      const writeCb = cbWhenCount(data.length, read);
      data.forEach(d =>
        duplex.write(d, err => {
          assert.isUndefined(err);
          writeCb();
        })
      );
    })
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
        assert.isEmpty(d1.queue);
        assert.deepEqual(data, d2data);
        cb();
      });

      d2.on('data', data => {
        assert.isEmpty(d2.queue);
        assert.deepEqual(data, d1data);
        cb();
      });

      d1.write(d1data);
      d2.write(d2data);
    });
  });
});
