import {ObjectReader, ObjectWriter} from '../src';
import {Rounder} from './rounder';

const input = [1.2, 2.6, 3.7];
const transform = new Rounder({objectMode: true});
const reader = new ObjectReader(input);
const writer = new ObjectWriter();

reader.pipe(transform).pipe(writer);

writer.on('finish', () => {
  console.log(writer.data);
});
