module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.test.json',
      },
    },
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
  };