module.exports = {
    apps: [
      {
        name: 'myapp',
        script: './src/server.js',
  
        env_production: {
          NODE_ENV: 'production',
          DATABASE_URL: 'postgres://postgres:root@127.0.0.1:5432/everchicdb',
          TOKEN_SECRET: '0f62cc24624944b7c77802b38105d3b0de4536fa109d189e7b085b4257ab7276b7318161d20cc34a54e52f7eba04d23b71f9ec87b713f9769dd0b227c946b419',
          EMAIL: 'everchic.sa@gmail.com',
          PASSWORD: 'dufirlncksjyqeeu',
          HCAPTCHA_ID: '187e0876-793a-422a-b2da-d11e9eea6d2a',
          HCAPTCHA_SECRET: 'ES_b968e2c005bc48e890670989c9b87eab',
          PORT: 5000,
          PORT_CHAT_WHATSAPP: 3005
          // Puedes agregar más variables de entorno específicas para producción >
        }
      }
    ]
  };
  