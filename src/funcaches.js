const { DEFAULT_TTL, UPDATE_TYPE: UT } = require('./constants');
const storeMemoryModule = require('./storeMemoryModule');

// Private methods
const prv = {
  isValidCache(key) {
    return Object.hasOwnProperty.call(this.$caches, key) && (() => {
      const { setAt, ttl } = this.$caches[key];
      return Date.now() - setAt < ttl * 1000;
    })();
  },
  updateCaches({ type, key, value }) { // Avoid using Proxy or Object.observe to keep ES5 support
    storeMemoryModule[type].call(this, { key, value });
    if (this.persistModule) this.persistModule[type].call(this, { key, value });
  },
};

class Cache {
  constructor({ persistModule } = {}) {
    this.persistModule = persistModule;
    this.$caches = this.persistModule ? this.persistModule.load() : {};
  }

  setTTL(key, ttl) {
    prv.updateCaches.call(this, {
      key,
      type: UT.update,
      value: { ttl },
    });
  }

  remove(key) {
    prv.updateCaches.call(this, {
      key,
      type: UT.remove,
    });
  }

  clearAll() {
    prv.updateCaches.call(this, {
      type: UT.clearAll,
    });
  }

  use(key, contentFunction, { ttl = DEFAULT_TTL } = {}) {
    return new Promise((resolve, reject) => (
      prv.isValidCache.call(this, key)
        ? resolve(this.$caches[key].value)
        : (() => {
          Promise.resolve(contentFunction())
            .then((value) => {
              prv.updateCaches.call(this, {
                key,
                value: { value, ttl, setAt: Date.now() },
                type: UT.add,
              });
              resolve(value);
            }).catch(err => reject(err));
        })()
    ));
  }
}

module.exports = Cache;
