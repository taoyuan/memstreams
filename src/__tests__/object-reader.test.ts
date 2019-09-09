import {assert} from 'chai';
import {ObjectReader} from "../object-reader";

describe('ObjectReader', function () {
  it('should work with array as source', function (done) {
    const source = [1, 2, 3, 4, 5];
    const stream = new ObjectReader(source);
    const expected = source[Symbol.iterator]();

    stream.on('data', data => assert.deepEqual(data, expected.next().value));
    stream.on('end', done);
  });

  it('should work with string as source', function (done) {
    const source = '12345';
    const stream = new ObjectReader(source);
    const expected = source[Symbol.iterator]();

    stream.on('data', data => assert.deepEqual(data, expected.next().value));
    stream.on('end', done);
  });

  it('should work with generator as source', function (done) {
    function* generator() {
      for (let i = 0; i < 5; i++) {
        yield i;
      }
    }
    const source = generator();
    const stream = new ObjectReader(source);
    const expected = generator();

    stream.on('data', data => assert.deepEqual(data, expected.next().value));
    stream.on('end', done);
  });
});
