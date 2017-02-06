// const oldTestContext = require.context('./src', true, /\.test\.tsx?$/);
// oldTestContext.keys().forEach(oldTestContext);

const testContext = require.context('./test', true, /\.tsx?$/);
testContext.keys().forEach(testContext);

// const sourceContext = require.context('./src', true, /(?!\.test)\.tsx?$/);
// sourceContext.keys().forEach(sourceContext);
