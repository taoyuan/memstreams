import {assert} from 'chai';
import sinon = require('sinon');
import {ObjectWriter} from "../object-writer";
import {ObjectReader} from "../object-reader";

describe('ObjectWriter', function () {

  it('should write array', function (done) {
    const writer = new ObjectWriter();
    // Given
    const cb = sinon.spy();
    const data = [1, 2, 3, 4, 5];
    // When
    data.forEach(d => writer.write(d, cb));
    writer.end();
    // Then
    writer.on('finish', () => {
      assert.equal(cb.callCount, data.length);
      const res = writer.data;
      assert.instanceOf(res, Array);
      assert.deepEqual(res, data);
      done();
    });
  });

  // TODO should we support flatten mode ?
  it.skip('should flatten data', function (done) {
    const writer = new ObjectWriter();
    // Given
    const cb = sinon.spy();
    const data = [1, 2, [3, 4, 5]];
    // When
    data.forEach(d => writer.write(d, cb));
    writer.end();
    // Then
    writer.on('finish', () => {
      assert.equal(cb.callCount, data.length);
      const res = writer.data;
      assert.instanceOf(res, Array);
      assert.deepEqual(res, [1, 2, 3, 4, 5]);
      done();
    });
  });

  it('should pipe with reader', done => {
    const writer = new ObjectWriter();
    // Given
    const data = [1, { foo: 'bar' }, 'string', true];
    const reader = new ObjectReader(data);
    // When
    reader.pipe(writer);
    // Then
    writer.on('finish', () => {
      const res = writer.data;
      assert.instanceOf(res, Array);
      assert.deepEqual(res, data);
      done();
    });
  });

});
