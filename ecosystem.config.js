module.exports = {
  apps: [
    {
      name: "simpend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
