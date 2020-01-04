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
  imagesS3: {
    endPoint: process.env.IMAGES_S3_ENDPOINT || 'play.min.io',
    accessKey: process.env.IMAGES_S3_ACCESS || 'Q3AM3UQ867SPQQA43P2F',
    port: parseInt(process.env.IMAGES_S3_PORT, 10) || 9000,
    useSSL: true,
    secretKey: process.env.IMAGES_S3_SECRET || 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
    bucket: 'booster-products-images',
    region: process.env.IMAGES_S3_REGION === '' ? null : process.env.IMAGES_S3_REGION,
  },
}
