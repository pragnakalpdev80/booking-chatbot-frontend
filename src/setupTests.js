import "@testing-library/jest-dom";

if (!global.crypto) {
  global.crypto = {};
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () =>
    Math.random().toString(36).substring(2) + Date.now().toString(36);
}
