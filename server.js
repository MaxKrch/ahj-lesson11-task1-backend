const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const Router = require('koa-router');
const serv = new Koa();
const router = new Router();
const { processingRequest } = require('./app/api/processingRequest.js');

serv
	.use(cors())
	.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  }));

router.get('/messages/unread', async (ctx, next) => {
	ctx.response.body = await processingRequest();
})

serv
	.use(router.routes())
	.use(router.allowedMethods())

const port = process.env.PORT || 7070;
serv.listen(port);