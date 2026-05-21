// CJS bridge — Nx's executor uses require() to load configs.
// Returning a Promise causes Nx to await the ESM implementation.
module.exports = import("./webpack.config.js").then((m) => m.default)
