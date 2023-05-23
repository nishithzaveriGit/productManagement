/* eslint-disable */
module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/setupJest.js'],
}