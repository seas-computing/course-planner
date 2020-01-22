let specGlobs = [];
if (process.argv.includes('--client')) {
  specGlobs.push('src/client/**/__tests__/*.test.ts');
  specGlobs.push('src/client/**/__tests__/*.test.tsx');
}
if (process.argv.includes('--server')) {
  specGlobs.push('src/server/**/__tests__/*.test.ts');
  specGlobs.push('src/server/**/__tests__/*.test.tsx');
}
if (process.argv.includes('--integration')) {
  specGlobs.push('tests/integration/**/*.test.ts');
}
module.exports = {
  exit: true,
  ui: 'bdd',
  reporter: 'spec',
  timeout: 30000,
  file: '.mochainit.ts',
  recursive: true,
  require: [
    'ignore-styles',
    'ts-node/register/type-check',
    'raf/polyfill',
    'tsconfig-paths/register',
  ],
  extension: ['ts', 'tsx', 'js'],
  spec: specGlobs.length > 0
    ? specGlobs
    : ['src/**/*.test.ts', 'src/**/*/*.test.tsx', 'tests/integration/**/*.test.ts'],
}
