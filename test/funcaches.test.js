const chai = require('chai');
const spies = require('chai-spies');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

const Funcaches = require('../src/funcaches');
const storeMemoryModule = require('../src/storeMemoryModule');

chai.use(spies);
chai.use(chaiAsPromised);
chai.should();

const { DEFAULT_TTL } = require('../src/constants');

const funcaches = new Funcaches();

describe('#Funcaches', () => {
  let cacheFunction;
  let myHeavyFunction;
  let clock;

  const RESULT = 'OK';
  const ERR = 'Error!!';
  const CKEY = 'cache-key';

  beforeEach(() => {
    clock = sinon.useFakeTimers();

    myHeavyFunction = chai.spy(({ forcefail } = {}) => new Promise((resolve, reject) => {
      setTimeout(forcefail ? reject(new Error(ERR)) : resolve.bind(this, RESULT), 10);
      clock.tick(11);
    }));

    cacheFunction = async ({ forcefail } = {}) => funcaches.use(
      CKEY,
      myHeavyFunction.bind(this, { forcefail }),
      { ttl: 20 },
    );
  });

  afterEach(() => {
    funcaches.remove(CKEY);
    chai.spy.restore();
    clock.restore();
  });

  it('should only call asyncFunction once', async () => {
    await cacheFunction();
    await cacheFunction(); // Got from cache

    myHeavyFunction.should.have.been.called.once;
  });

  it('should return correct value', async () => {
    const value1 = await cacheFunction();
    const value2 = await cacheFunction(); // Got from cache

    value1.should.equal(RESULT);
    value2.should.equal(RESULT);
  });

  it('should be able to clear specific cache by key', async () => {
    await cacheFunction();
    funcaches.remove(CKEY);

    await cacheFunction();
    funcaches.remove(CKEY);

    await cacheFunction();
    funcaches.remove(CKEY);

    myHeavyFunction.should.have.been.called.exactly(3);
  });

  it('should be able to clear all caches', async () => {
    await cacheFunction();

    const OTHER_KEY = 'some-other-key';
    await funcaches.use(OTHER_KEY, () => true);

    funcaches.clearAll();

    Object.keys(funcaches.$caches).length.should.equal(0);
  });

  it('should be able to reassign ttl', async () => {
    await cacheFunction();
    funcaches.setTTL(CKEY, 300);

    clock.tick(600 * 1000);

    await cacheFunction();

    myHeavyFunction.should.have.been.called.twice;
  });

  it('should be able to throw error function', () => (
    cacheFunction({ forcefail: true }).should.be.rejectedWith(ERR)
  ));

  it('should use DEFAULT_TTL when ttl options is not passed', async () => {
    const OTHER_KEY = 'some-other-key';
    await funcaches.use(OTHER_KEY, () => true);

    funcaches.$caches[OTHER_KEY].ttl.should.equal(DEFAULT_TTL);
    funcaches.remove(OTHER_KEY);
  });

  it('should call defined persistModule', async () => {
    const dummyPersistModule = {
      ...storeMemoryModule, // Clone, avoiding unknown methods.
      clearAll: chai.spy(() => {
        // do something here
        // to clear all caches from persist storage
      }),
    };

    const newfuncaches = new Funcaches({ persistModule: dummyPersistModule });

    newfuncaches.clearAll();
    newfuncaches.clearAll();

    dummyPersistModule.clearAll.should.have.been.called.twice;
  });
});
