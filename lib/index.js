const babylon = require('babylon');

function analyzeType(typeNode, path, t, template) {
  if (typeNode.id.name === 'Parameters') {
    const params = [];
    (typeNode.right.properties || []).forEach(prop => {
      const propName = prop.key.name;
      const container = prop.value.id.name;
      params.push(`${propName}: extract(req, '${propName}', '${container}')`);
    });

    const body = babylon.parse(`
    module.exports.parameters = (req) => {
      return {
        ${params.join(',\n')}
      };
    };
    `).program.body[0];
    path.replaceWith(body);
  }

}

module.exports = function (babel) {
  const {types: t, template, parse} = babel;
  return {
    visitor: {
      ExportNamedDeclaration(path, state) {
        const node = path.node;
        if (node.declaration.type === 'TypeAlias') {
          analyzeType(node.declaration, path, t, template);
        }
        //path.replaceWithSourceString('ХУЙ');
      },
    }
  };
}