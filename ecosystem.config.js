module.exports = {
  // npm i -g pm2
  // cd <directory>
  // pm2 start ecosystem.config.js
  apps: [
    {
      name: "chess-app-frontend",
      script: "npm",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
    },
  ],
};
