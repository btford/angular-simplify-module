var falafel = require('falafel');

var TYPE_NAMES = [
  'controller',
  'factory'
];

var METHOD_RE = new RegExp('\.(' + TYPE_NAMES.join('|') + ')$');

/*
 * this code is garbage
 *
 *
 * im sorry
 */
module.exports = function (js) {

  var modulesDefined = [],
      modulesRequired = [];

  var type = TYPE_NAMES.reduce(function (obj, name) {
    return obj[name] = {}, obj;
  }, {});

  var src = falafel(js, function (node) {
    var match = null;
    if (node.type === 'CallExpression' && node.callee.source() === 'angular.module') {
      //console.log(node.source());
      var defined = node.arguments[0].value;
      modulesDefined.push(defined);

      var required = node.arguments[1];
      if (required.elements) {
        modulesRequired = modulesRequired.concat(required.elements.map(function (node) {
          return node.value;
        }));
      }

    }
    if (node.type === 'CallExpression' && (match = node.callee.source().match(METHOD_RE))) {
      var typeName = match[1];
      var name = node.arguments[0].value;
      var source = node.arguments[1].source();
      if (type[typeName][name]) {
        console.log('Warning: overwriting ' + name);
      }
      type[typeName][name] = source;
    }
  }).toString();

  var topLevelModule = modulesDefined.filter(function (moduleName) {
    return modulesRequired.indexOf(moduleName) === -1;
  })[0];

  modulesRequired = modulesRequired.filter(function (moduleName) {
    return modulesDefined.indexOf(moduleName) === -1;
  });

  return 'angular.module(\'' + topLevelModule + '\', [' +
    modulesRequired.map(function (moduleName) {
      return '\'' + moduleName + '\'';
    }).join(', ') + '])' + Object.keys(type).map(function (typeName) {
      var typeCollection = type[typeName];
      var typeCollectionNames = Object.keys(typeCollection);

      if (typeCollectionNames.length === 0) {
        return '';
      } else if (typeCollectionNames.length === 1) {
        return '.' + typeName + '(\'' + typeCollectionNames[0] + '\', ' + typeCollection[typeCollectionNames[0]] + ')';
      }
      return '.' + typeName + '({' + typeCollectionNames.map(function (name) {
        return name + ': ' + typeCollection[name];
      }).join(', ') + '})';
    }).join('') + ';';

  return src;
};
