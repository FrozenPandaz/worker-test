module.exports = {
  name: 'lib70',
  preset: '../../jest.config.js',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
    }
  },
  transform: {
    '^.+\\.[tj]sx?$':  'ts-jest' 
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/libs/lib70'
};