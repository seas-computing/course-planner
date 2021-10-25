let specGlobs = [];
process.env.MOCHA_NEEDS_DATABASE = process.env.MOCHA_NEEDS_DATABASE || '1';
if (process.argv.includes('--client')) {
  process.env.MOCHA_NEEDS_DATABASE = '0';
  specGlobs.push('src/client/**/__tests__/*.test.ts');
  specGlobs.push('src/client/**/__tests__/*.test.tsx');
}
if (process.argv.includes('--server')) {
  process.env.MOCHA_NEEDS_DATABASE = '0';
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
  global: ['database'],
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
