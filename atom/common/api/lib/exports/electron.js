// Do not expose the internal modules to `require`.
exports.hideInternalModules = function() {
  var globalPaths;
  globalPaths = require('module').globalPaths;
  if (globalPaths.length === 3) {

    // Remove the "common/api/lib" and "browser-or-renderer/api/lib".
    return globalPaths.splice(0, 2);
  }
};

// Attaches properties to |exports|.
exports.defineProperties = function(exports) {
  return Object.defineProperties(exports, {

    // Common modules, please sort with alphabet order.
    clipboard: {

      // Must be enumerable, otherwise it woulde be invisible to remote module.
      enumerable: true,
      get: function() {
        return require('../clipboard');
      }
    },
    crashReporter: {
      enumerable: true,
      get: function() {
        return require('../crash-reporter');
      }
    },
    nativeImage: {
      enumerable: true,
      get: function() {
        return require('../native-image');
      }
    },
    shell: {
      enumerable: true,
      get: function() {
        return require('../shell');
      }
    },

    // The internal modules, invisible unless you know their names.
    CallbacksRegistry: {
      get: function() {
        return require('../callbacks-registry');
      }
    },
    deprecate: {
      get: function() {
        return require('../deprecate');
      }
    }
  });
};
