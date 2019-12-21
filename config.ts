export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'this_is_booster_development_jwt_secret',
  },
  postgres: {
    active: process.env.POSTGRES === 'true',
    host: process.env.POSTGRES_HOST || '127.0.0.1:5432',
    database: process.env.POSTGRES_DATABASE || 'booster',
    user: process.env.POSTGRES_USER || 'booster',
    password: process.env.POSTGRES_PASSWORD || 'booster',
  },
}
