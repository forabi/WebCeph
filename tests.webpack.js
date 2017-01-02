const testContext = require.context('./src', true, /\.test\.tsx?$/);
testContext.keys().forEach(testContext);

// const sourceContext = require.context('./src', true, /(?!\.test)\.tsx?$/);
// sourceContext.keys().forEach(sourceContext);
