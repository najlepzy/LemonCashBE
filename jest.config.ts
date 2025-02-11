import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@error-handlers/(.*)$': '<rootDir>/src/error-handlers/$1',
    '^@interface/(.*)$': '<rootDir>/src/interface/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@notifications/(.*)$': '<rootDir>/src/notifications/$1',
    '^@pipes/(.*)$': '<rootDir>/src/pipes/$1',
    '^@prisma/client/(.*)$': '<rootDir>/node_modules/@prisma/client/$1',
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client',
    '^@prisma/(.*)$': '<rootDir>/src/prisma/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
