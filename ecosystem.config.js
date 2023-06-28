module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  }],
  deploy : {
    production : {
      user : 'root',
      host : '91.121.41.208',
      ref  : 'origin/server',
      repo : 'git@github.com:Big-Brother-SMB/Web.git',
      path : '/home/site',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
