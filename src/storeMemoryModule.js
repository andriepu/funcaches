const { UPDATE_TYPE: UT } = require('./constants');

module.exports = {
  load() {
    return {};
  },
  [UT.add]({ key, value }) {
    this.$caches[key] = value;
  },
  [UT.update]({ key, newMembers = {} }) {
    this.$caches[key] = Object.assign(
      this.$caches[key],
      newMembers,
    );
  },
  [UT.remove]({ key }) {
    delete this.$caches[key];
  },
  [UT.clearAll]() {
    this.$caches = {};
  },
};
