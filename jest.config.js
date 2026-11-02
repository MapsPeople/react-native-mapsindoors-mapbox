/**
 * Unit tests for the shared TypeScript in src/core.
 *
 * The tests themselves live in the react-native-mapsindoors-core submodule, so both map packages
 * run the same suite. They cover only logic that needs no native bridge - coordinate ordering,
 * filter construction, geometry maths, BCP-47 language-tag handling, and the error mapping the
 * bridge wrappers do against the mock - and run in plain Node in seconds, with no simulator and no
 * API keys. Behavior that crosses the bridge is covered on-device by mapsindoors-sdk-react-native.
 */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/core/__tests__/**/*.test.ts'],
  // src/core imports react-native for Platform and the native modules; stub it out at runtime.
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
  transform: {
    // `paths` points TypeScript at the same mock the runtime uses. Without it, ts-jest tries to
    // typecheck against real React Native, which since 0.87 exposes its types only through the
    // package `exports` map - invisible to this project's classic module resolution, which fails
    // with TS7016. Resolving to the mock is also more honest: the mock is what the tests run
    // against, so a missing export is a type error instead of an undefined at runtime.
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          baseUrl: '.',
          paths: { 'react-native': ['__mocks__/react-native.ts'] },
        },
      },
    ],
  },
  clearMocks: true,
};
