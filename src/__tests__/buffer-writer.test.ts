import * as fs from 'fs';
import {expect, sinon} from '@tib/testlab';
import {BufferWriter} from '../buffer-writer';
import {BufferReader} from '../buffer-reader';

describe('BufWritable', function () {
  it('should write buffer', function (done) {
    const cb = sinon.spy();
    const data = "I'm a proud string";

    const writer = new BufferWriter();

    for (let i = 0; i < data.length; i++) {
      writer.write(Buffer.from(data.charAt(i)), cb);
    }
    writer.end();

    writer.on('finish', () => {
      expect(cb.callCount).equal(data.length);
      const buffRes = writer.data;
      expect(buffRes).instanceOf(Buffer);
      expect(buffRes.toString()).equal(data);
      done();
    });
  });

  it('should write string', function () {
    // Write method
    const writer = new BufferWriter();
    writer.write('Hello World\n');
    expect(writer.data).ok();
    expect(writer.data).deepEqual(Buffer.from('Hello World\n'));

    // Write more
    writer.write('Hello Universe\n');
    expect(writer.data).deepEqual(Buffer.from('Hello World\nHello Universe\n'));
  });

  it('should pipe with buffer reader', function (done) {
    // Given
    const data = "I'm a proud string";
    const reader = new BufferReader(data);
    const writer = new BufferWriter();
    // When
    reader.pipe(writer);
    // Then
    writer.on('finish', () => {
      const buffRes = writer.data;
      expect(buffRes).instanceOf(Buffer);
      expect(buffRes).deepEqual(Buffer.from(data));
      done();
    });
  });

  it('should pipe with fs stream', function (done) {
    const content = fs.readFileSync('package.json');
    const reader = fs.createReadStream('package.json');
    const writer = new BufferWriter();
    reader.pipe(writer);
    setTimeout(function () {
      expect(writer.data.toString()).equal(content.toString());
      done();
    }, 10);
  });

  it('should forward to reader', function (done) {
    const reader = new BufferReader();
    const writer = new BufferWriter();
    writer.forward(reader);

    reader.on('data', data => {
      expect(data).instanceOf(Buffer);
      expect(data.toString()).equal('hello');
      done();
    });

    writer.write('hello');
  });
});
