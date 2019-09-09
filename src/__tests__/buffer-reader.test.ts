import {assert} from 'chai';
import {BufferReader} from "../buffer-reader";

describe('MemReadable', function () {
  it('should read', function () {
    // Read method
    const reader = new BufferReader(['Hello World\n']);
    assert.deepEqual(reader.read().toString(), 'Hello World\n');
    assert.notOk(reader.read());

    assert.throws(() => reader.push('Hello Universe\n'), 'stream.push() after EOF');
  });

  it('should work with buffer as source', function (done) {
    const source = Buffer.from('test');
    const stream = new BufferReader(source);
    const itExpected = source[Symbol.iterator]();

    stream.on('data', data => {
      assert.deepEqual(data, Buffer.from([itExpected.next().value]));
    });
    stream.on('end', done);
  });

  it('should work with string as source', function (done) {
    const source = 'test';
    const stream = new BufferReader(source);
    const itExpected = source[Symbol.iterator]();

    stream.on('data', data => {
      assert.deepEqual(data, Buffer.from(itExpected.next().value));
    });
    stream.on('end', done);
  });
});
