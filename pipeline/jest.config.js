module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
    'cobertura'
  ],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Sales Automation Test Results',
        outputPath: 'test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
        executionMode: 'allFiles',
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        logoImg: 'https://via.placeholder.com/150x50/2D3748/FFFFFF?text=MHM',
        customScriptPath: './test-assets/custom-script.js',
        customStylesPath: './test-assets/custom-styles.css'
      }
    ]
  ],
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@orchestration/(.*)$': '<rootDir>/src/orchestration/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/config/$1'
  },
  testTimeout: 30000
};