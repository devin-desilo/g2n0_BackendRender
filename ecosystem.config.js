module.exports = {
  apps: [
    {
      name: 'get2net0.io',
      cwd: '.',
      script: 'dist/main.js',
      mode: 'cluster',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
