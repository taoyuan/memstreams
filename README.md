# Memory Stream

[![build status](https://secure.travis-ci.org/taoyuan/memstreams.svg)](http://travis-ci.org/taoyuan/memstreams)
[![npm](https://img.shields.io/npm/v/memstreams.svg?logo=npm)](https://www.npmjs.com/package/memstreams)
[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/taoyuan/memstreams.svg?logo=snyk)](https://github.com/taoyuan/memstreams/network/alerts)
[![Code Climate coverage](https://img.shields.io/codeclimate/coverage/taoyuan/memstreams.svg?logo=code-climate)](https://codeclimate.com/github/taoyuan/memstreams)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/taoyuan/memstreams.svg?logo=code-climate)](https://codeclimate.com/github/taoyuan/memstreams)
[![Greenkeeper badge](https://img.shields.io/badge/-enabled-green.svg?logo=greenkeeper&color=grey)](https://greenkeeper.io/)
[![Greenkeeper badge](https://badges.greenkeeper.io/taoyuan/memstreams.svg)](https://greenkeeper.io/)
![node](https://img.shields.io/node/v/memstreams.svg?label=&logo=node.js&color=grey)
![npm type definitions](https://img.shields.io/npm/types/memstreams.svg)
![GitHub](https://img.shields.io/github/license/taoyuan/memstreams.svg)

> Memory Streams library for JavaScript based on readable-stream

> This library is forked from
> [stream-mock](https://github.com/b4nst/stream-mock)

## Features

- Create a
  [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams)
  from any iterable.
- Create a
  [writable stream](https://nodejs.org/api/stream.html#stream_writable_streams)
  that puts its data at your disposal.
- Create a
  [duplex stream](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams)
  that combines a readable and writable stream together.
- Can operate both in
  [object](https://nodejs.org/api/stream.html#stream_object_mode) and normal (
  [Buffer](https://nodejs.org/api/buffer.html#buffer_buf_length) ) mode.
- Forward writable to readable through event `write` to replace `queue`

## Quick start

```shell
yarn add memstreams
```

Or, if you are more a `npm` person

```shell
npm i memstreams
```

### Basic usage

You are building an awesome brand new
[Transform stream](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams)
that rounds all your values.

`rounder.ts`

```javascript
import {Transform} from 'stream';

export class Rounder extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(Math.round(chunk));
    callback();
  }
}
```

Now you need / want to test it.

`example.ts`

```typescript
import {ObjectReader, ObjectWriter} from 'memstream';
import {Rounder} from './rounder';

const input = [1.2, 2.6, 3.7];
const transform = new Rounder({objectMode: true});
const reader = new ObjectReader(input, {autoEnd: true});
const writer = new ObjectWriter();

reader.pipe(transform).pipe(writer);

writer.on('finish', () => {
  console.log(writer.data);
});
```

---

## License

MIT
