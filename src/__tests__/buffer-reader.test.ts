import {expect} from '@tib/testlab';
import {BufferReader} from '../buffer-reader';

describe('MemReadable', function () {
  it('should read', function () {
    // Read method
    const reader = new BufferReader(['Hello World\n']);
    expect(reader.read().toString()).equal('Hello World\n');
    expect(reader.read()).not.ok();

    expect(() => reader.push('Hello Universe\n')).throw(
      'stream.push() after EOF',
    );
  });

  it('should work with buffer as source', function (done) {
    const source = Buffer.from('test');
    const stream = new BufferReader(source);
    const itExpected = source[Symbol.iterator]();

    stream.on('data', data => {
      expect(data).deepEqual(Buffer.from([itExpected.next().value]));
    });
    stream.on('end', done);
  });

  it('should work with string as source', function (done) {
    const source = 'test';
    const stream = new BufferReader(source);
    const itExpected = source[Symbol.iterator]();

    stream.on('data', data => {
      expect(data).deepEqual(Buffer.from(itExpected.next().value));
    });
    stream.on('end', done);
  });
});
