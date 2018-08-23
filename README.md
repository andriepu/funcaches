[![Build Status](https://travis-ci.org/andriepu/funcaches.svg?branch=master)](https://travis-ci.org/andriepu/funcaches) [![Coverage Status](https://coveralls.io/repos/github/andriepu/funcache/badge.svg?branch=master)](https://coveralls.io/github/andriepu/funcache?branch=master)

# Funcaches
> Simple function caching implementation

## Installation
**Node**
```
$ npm install funcaches 
```
**Browser**
```
<script src="https://unpkg.com/funcaches@1.0.0/dist/funcaches.min.js"></script>
```

## Usage 
```
const Funcaches = require('funcaches');
const funcaches = new Funcaches();

const heavyFunction = () => (
  new Promise(resolve => setTimeout(resolve.bind(this, 'myvalue'), 1000)
);

const cachedFunction = async () => (
  funcaches.use('cache-key-1', heavyFunction, { ttl: 3600 });
);


(async () => {
  const value1 = await cachedFunction();
  const value2 = await cachedFunction(); // (hit cache)

  console.log(value1); // -> myvalue
  console.log(value2); // -> myvalue
})();
```

## API
### use(key: `string`, function: `function`, options: `object`)
Returns a `Promise` that is fulfilled with function result.

```
(async () => {
  const result1 = await funcaches.use('cache-key-1', () => (
    new Promise(resolve => setTimeout(resolve.bind(this, 'myvalue', 1000)
  ), { ttl: 3600 });

  const result2 = await funcaches.use('cache-key-2', () => {
    doSomething();
    return 'somevalue';
  });

  console.log(result1); // -> myvalue
  console.log(result2); // -> somevalue
}();  
```

- **options**
  - `ttl (Number)`: time in seconds for the cache to kept alive. Default is `300`.

### setTTL(key: `string`, ttl: `number`)
  Reassign the value of `ttl`. It's useful when you cannot define the ttl in the beginning.

```
const token = await funcaches.use('getTokenAsync', getTokenAsync);
funcaches.setTTL('cache-token', token.expires_in);
```

### delete(key: `string`)
Delete cache by key
```
funcaches.delete('cache-key-1');
```

## Test
```
$ npm test
```
