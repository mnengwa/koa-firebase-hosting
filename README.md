# Koa Firebase Hosting

This small project is an example of how you can host your Koa / Express app on Firebase using Google's serveless functions on the Firebase platform.

> Typically, most developers use Firebase hosting for their SPA static files.

Below are the steps of how you go about hosting your KoaJS project on Firebase. ***Ensure [NodeJS](https://nodejs.org/en/) is installed on your local computer**

## Step 1
Install Firebase CLI tools using the command:
```bash
$ sudo npm i -g firebase-tools
```

## Step 2
Initialize Firebase hosting for your project using the command:
```bash
$ firebase init hosting
```

## Step 3
Setup the Firebase dynamic cloud functions using the command:
```bash
$ firebase init functions
```

At this stage you will have two directories:
1. ```/public``` where all static files will be hosted from.

2. ```/functions``` where all dynamic assets will be hosted from e.g API endpoints

## Step 4
Setup up our basic KoaJS application. This will be done in the functions folder. Run the following commands to archieve this:
1. Go into the functions directory
```bash
$ cd funtions
```

2. Install Koa & Koa router
```bash
$ npm i -S koa @koa/router
```

3. Create a file index.js in the functions folder. This is where we will put our server code.
```javascript
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

```

## Step 4
Setup HTTP request rewrites for our Koa JS application. Edit the ```firebase.json``` file at the root of your project to look like the following code below:
```json
{
    "hosting": {
        "public": "public",
        "rewrites": [{
            "source": "**",
            "function": "app"
        }],
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ]
    }
}
```

> We know to call the function ```app``` because it's a named export in functions ```index.js```.

## Step 5
Let's test our application locally using the following incarnation from the Firebase tools:
```bash
$ firebase serve --only functions,hosting
```

> Ensure to delete the **index.html** file in the ```/public``` directory. This enables you to use the ```GET /``` endpoint on your application.

## Step 6
Finally we get to deploy our backend application on Firebase.
```bash
$ firebase deploy
```