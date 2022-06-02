module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverage: false,
  collectCoverageFrom: ['*.js', '!**/node_modules/**', '!jest.config.js'],
  // transform: {
  //   '^.+\\.(js|jsx)?$': 'babel-jest',
  // },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testPathIgnorePatterns: ['__snapshots__', '__file_snapshots__'],
  watchPathIgnorePatterns: ['__file_snapshots__', 'fixtures'],
}
