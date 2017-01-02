const testsContext = require.context('./src', true, /\.test\.tsx?$/);
testsContext.keys().forEach(testsContext);
// const componentsContext = require.context('./src/components/', true, /.+(?!\.test)\.tsx?$/);
// componentsContext.keys().forEach(componentsContext);
