// pm2.config.js

module.exports = {
  apps: [
    {
      name: "seregela-admin-dashboard",
      script: "start.js",        // Use the wrapper script to honor PORT from .env
      env_file: ".env",          // Load .env variables
      ignore_watch: [
        "node_modules",
        ".next",
        "logs"
      ]
    }
  ]
};
