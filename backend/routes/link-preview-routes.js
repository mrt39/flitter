//link preview endpoint with redis caching
//securely sends requests to linkpreview.net while protecting api key
//implements persistent caching to via upstash redis to store the preview data, in order to improve performance and reduce external api calls
//includes rate limiting to prevent abuse and excessive api usage

//link preview endpoint with redis caching
//implements a secure and efficient system for fetching link previews:
//1. frontend first checks its localStorage cache for instant preview display
//2. if not in frontend cache, request comes to this backend endpoint
//3. backend checks redis cache first to avoid unnecessary external api calls
//4. if not in redis cache, securely calls linkpreview.net with protected api key
//5. response is cached in redis for future requests from any user
//6. response is sent back to frontend which also caches it in localStorage
//7. implements rate limiting to prevent abuse and excessive api usage
//this architecture protects our api key while maximizing performance through multi-layer caching

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const redis = require('../utilities/redis-client');
const rateLimit = require('express-rate-limit');

//cache TTL in seconds (30 days)
const CACHE_TTL = 30 * 24 * 60 * 60;

//rate limiting middleware
const previewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 90, // limit each IP to 90 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

//generate standardized cache key for a url
function generateCacheKey(url) {
  return `link_preview:${url.toLowerCase().trim()}`;
}

//create a basic preview from url when api fails
function createBasicPreview(url) {
  try {
    const urlObj = new URL(url);
    return {
      url: url,
      title: urlObj.hostname.replace('www.', ''),
      description: urlObj.pathname.length > 1 ? urlObj.pathname : 'Homepage',
      images: [`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`],
      success: true
    };
  } catch (error) {
    return { url, success: false };
  }
}

//link preview endpoint
router.get('/link-preview', previewLimiter, async (req, res) => {
  try {
    const url = req.query.url;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    //generate cache key
    const cacheKey = generateCacheKey(url);
    
    //check redis cache first to see whether a preview for this link exists
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
    } catch (cacheError) {
      //log but continue if Redis has an error, don't let cache failures break functionality
      console.error('Redis cache error:', cacheError);
    }
    
    //if not in cache, fetch from external linkpreview api
    const apiKey = process.env.LINKPREVIEW_API_KEY;
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    //structure the response data
    const previewData = {
      url: url,
      title: data.title || new URL(url).hostname,
      description: data.description || '',
      images: data.image ? [data.image] : [],
      success: true
    };
    
    //save to Redis cache
    try {
      await redis.setex(cacheKey, CACHE_TTL, previewData);
    } catch (redisError) {
      console.error('Redis cache save error:', redisError);
    }
    
    //return the preview data
    return res.json(previewData);
    
  } catch (error) {
    console.error('Error in link preview endpoint:', error);
    
    //create basic preview on error
    try {
      const basicPreview = createBasicPreview(req.query.url);
      
      //try to cache the basic preview
      try {
        const cacheKey = generateCacheKey(req.query.url);
        await redis.setex(cacheKey, CACHE_TTL, basicPreview);
      } catch (redisError) {
        console.error('Redis cache save error for basic preview:', redisError);
      }
      
      return res.json(basicPreview);
    } catch (err) {
      return res.status(500).json({ 
        error: 'Failed to fetch link preview',
        url: req.query.url,
        success: false 
      });
    }
  }
});

module.exports = router;