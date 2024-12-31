module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      buffer: require.resolve('buffer'),
    }
  }
};
  