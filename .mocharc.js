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
  specGlobs.push('tests/**/*.test.ts');
  specGlobs.push('tests/**/*.test.tsx');
}
module.exports = {
  exit: true,
  ui: 'bdd',
  reporter: 'spec',
  timeout: 30000,
  file: '.mochainit.ts',
  recursive: true,
  require: [
    'ts-node/register',
    'raf/polyfill',
    'tsconfig-paths/register',
    'jsdom-global/register',
    'ignore-styles',
  ],
  extension: ['ts', 'tsx', 'js'],
  spec: specGlobs.length > 0
    ? specGlobs
    : [
      'src/**/__tests__/*.test.ts',
      'src/**/__tests__/*.test.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
}
