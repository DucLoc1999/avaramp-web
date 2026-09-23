// PM2 entry for the AvaRamp web channel backend, which also serves the
// built SPA. Run `npm run build` first.
//
// Usage (from the repo root): pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'avarampl',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOST: '0.0.0.0',
        SPA_DIST_DIR: '../frontend/dist/spa',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
