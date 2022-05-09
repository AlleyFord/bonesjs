const path = require('path');

module.exports = {
  entry: './src/bones.js',
  mode: 'production',
  watchOptions: {
    ignored: [
      '**/node_modules',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bones.js',
  },
  optimization: {
    concatenateModules: true,
    mangleExports: 'size',
    mergeDuplicateChunks: true,
    minimize: true,
    moduleIds: 'size',
    nodeEnv: 'production',
    providedExports: true,
    removeAvailableModules: true,
    removeEmptyChunks: true,
  },
};
