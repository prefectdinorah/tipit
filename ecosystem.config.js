// 🎯 Конфигурация PM2 для двух окружений
// Production (main) на порту 3000, Staging (dev) на порту 3001

module.exports = {
  apps: [
    // 🟢 Production приложение (порт 3000)
    {
      name: "tipit-prod",
      script: "npm",
      args: "start",
      cwd: "/var/www/tipit-prod",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      output: "./logs/out.log",
      error: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    
    // 🟡 Staging приложение (порт 3001)
    {
      name: "tipit-staging",
      script: "npm",
      args: "start",
      cwd: "/var/www/tipit-staging",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3001,
      },
      output: "./logs/out.log",
      error: "./logs/error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
}
