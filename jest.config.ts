import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
  ],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/**/*.spec.ts?(x)'],
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.spec.node.ts?(x)'],
    },
  ],
};

export default config;
