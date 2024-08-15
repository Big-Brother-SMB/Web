module.exports = {
  apps : [{
    script: 'main.js',
    watch: '.'
  }],
  deploy : {
    production : {
      user : 'root',
      host : '151.80.78.83 ',
      ref  : 'origin/main',
      ssh_options: "StrictHostKeyChecking=no",
      repo : 'git@github.com:Big-Brother-SMB/Web.git',
      path : '/../home/site',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};