module.exports = {
  apps: [
    {
      name: 'periodista-ia-backend',
      script: './src/app.js',
      cwd: '/var/www/periodista-ia/Backend',
      exec_mode: 'cluster',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
