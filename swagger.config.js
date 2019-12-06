module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Booster back',
    version: '1.0.0',
    description: 'Booster global API',
  },
  servers: [
    {
      url: 'https://api.booster.fruitice.fr',
      description: 'Main (production) server'
    },
    {
      url: 'http://localhost:3000',
      description: 'Localhost (development) server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}