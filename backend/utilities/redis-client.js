//upstash redis client configuration for link previews
//provides persistent caching that works with vercel's serverless architecture
//uses rest api approach to avoid connection management issues in serverless environments
//ensures link preview cache persists in vercel's serverless architecture

const { Redis } = require('@upstash/redis');

//create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = redis;