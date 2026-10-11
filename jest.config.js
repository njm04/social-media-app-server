/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testTimeout: 60000,
};
