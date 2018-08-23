const createObjWithSameKeyValue = arr => (
  arr.reduce((result, i) => (
    Object.assign(result, { [i]: i })
  ), {})
);

module.exports = {
  DEFAULT_TTL: 300,
  UPDATE_TYPE: createObjWithSameKeyValue([
    'add',
    'update',
    'remove',
    'clearAll',
  ]),
};
