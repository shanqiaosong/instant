export default class Storable {
  toStorable() {
    const storable = {};
    Object.keys(this).forEach((storableKey) => {
      if (storableKey === 'state') return;
      if (typeof this[storableKey] === 'function') return;
      storable[storableKey] = this[storableKey];
    });
    return storable;
  }

  fromStorage(storage) {
    Object.keys(storage).forEach((storableKey) => {
      if (typeof storage[storableKey] !== 'function') {
        this[storableKey] = storage[storableKey];
      }
    });
  }
}
