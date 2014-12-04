var simplify = require('./simplify');

describe('simplify', function () {
  it('should remove intermediate modules', function () {
    expect(simplify(clean(function () {
      angular.module('a', ['b']).controller('a', [a]);
      angular.module('b', []).factory('b', [b]);
    }))).
    toBe(clean(function () {
      angular.module('a', []).controller('a', [a]).factory('b', [b]);
    }));
  });

  it('should not remove modules that are not defined in the src', function () {
    expect(simplify(clean(function () {
      angular.module('a', ['b', 'ngRoute']).controller('a', [a]);
      angular.module('b', []).factory('b', [b]);
    }))).
    toBe(clean(function () {
      angular.module('a', ['ngRoute']).controller('a', [a]).factory('b', [b]);
    }));
  });

  it('should only call each factory type once', function () {
    expect(simplify(clean(function () {
      angular.module('a', []).controller('a', [a]).controller('b', [b]);
    }))).
    toBe(clean(function () {
      angular.module('a', []).controller({a: [a], b: [b]});
    }));
  });
});

var RE = /^function \(.*?\) \{((:?.|[\r\n])*)\}$/;
function clean (fn) {
  return fn.toString().trim().replace(RE, function (match, body) {
    return body.trim();
  });
}
