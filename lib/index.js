import restify from 'restify';
import db from 'sqlite';
import Promise from 'bluebird';
const corsMiddleware = require('restify-cors-middleware');
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
})

const respond = (req, res, next) => {
  res.send('hello ' + req.params.name);
  next();
}

const server = restify.createServer();
server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser());

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.get('/tweets', async (req, res, next) => {
  try {
    const tweets = await db.all('SELECT * FROM Tweets');
    res.send(tweets);
  } catch (err) {
    next(err);
  }
});

server.post('/users', async (req, res, next) => {
  try {
    await db.run(`INSERT INTO Users (name, email, password) values ("${req.body.name}", "${req.body.email}", "${req.body.password}")`);
    res.send(200);
  } catch (err) {
    next(err)
  }
});

server.get('/users', async (req, res, next) => {
  try {
    const users = await db.all('SELECT * from Users');
    res.send(users);
  } catch (err) {
    next(err)
  }
});

server.post('/tweets', async (req, res, next) => {
  try {
    await db.run(`INSERT INTO Tweets (userId, text) values ("${req.body.userId}", "${req.body.text}")`);
    res.send(200);
  } catch (err) {
    next(err)
  }
});

server.get('/tweets', async (req, res, next) => {
  try {
    const tweets = await db.all(`SELECT userId, text from Tweets INNER JOIN Users ON Users.id=Tweets.userId`);
    res.send(tweets);
  } catch (err) {
    next(err)
  }
});

server.get('/tweets/:id', async (req, res, next) => {
  try {
    const tweets = await db.all(`SELECT * from Tweets JOIN Users ON userId="${req.params.id}"`);
    res.send(tweets);
  } catch (err) {
    next(err)
  }
});

Promise.resolve()
  .then(() => db.open('./database.sqlite', { Promise }))
  .then(() => db.migrate({ force: 'last' }))
  .catch((err) => console.error(err.stack))
  .finally(() => {
    server.listen(8080, () => {console.log('%s listening at %s', server.name, server.url);});
  });

