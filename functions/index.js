const fs = require('fs');
const Koa = require('koa');
const Router = require('@koa/router');
const functions = require('firebase-functions');

const app = new Koa(),
    router = new Router();

// Return a custom response for 404 errors using a middleware
app.use(async (ctx, next) => {
    try {
        await next();
        if (ctx.status === 404) {
            ctx.body = { error: 'API endpoint not found' }
        }
    } catch (error) {
        ctx.body = { error: 'Something went wrong!' }
    }
});

/**
 * Defining an endpoint: GET /
 * This endpoint reponds with a string
 * This endpoint is also cached on an edge server(the nearest to the client making the request)
 **/
router.get('/', (ctx, next) => {
    ctx.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    ctx.body = 'Hello World!';
});

/**
 * Defining an endpoint: GET /readme
 * 
 * This endpoint response with a HTML file
 * It does this by setting a readable stream as the body
 **/
router.get('/readme', (ctx, next) => {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('./assets/read-me.html');
});

/**
 * Defining an endpoint: GET /timestamp
 * 
 * This endpoint responds with JSON object
 **/
router.get('/timestamp', (ctx, next) => {
    ctx.body = { data: new Date().toISOString() };
});

app
    .use(router.routes())
    .use(router.allowedMethods());

exports.app = functions.https.onRequest(app.callback());
