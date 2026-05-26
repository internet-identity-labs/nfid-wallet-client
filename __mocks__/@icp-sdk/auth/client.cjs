// Used by packages/integration/src/lib/authentication/session-handling.ts
class IdleManager {
  static create(_options) {
    return new IdleManager()
  }
  registerCallback(_cb) {}
  exit() {}
}

module.exports = { IdleManager }
