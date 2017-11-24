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

server.post('/users', async (req, res, next) => {
  try {
    const addUser = await db.run(`INSERT INTO Users (name, email, password) values ("${req.body.name}", "${req.body.email}", "${req.body.password}")`);
    const user = await db.all(`SELECT * from Users WHERE id="${addUser.lastID}"`);

    res.send(user[0]);
  } catch (err) {
    next(err)
  }
});

server.put('/users', async (req, res, next) => {
  try {
    await db.run(`
      UPDATE Users
      SET 
        name="${req.body.name}",
        email="${req.body.email}", 
        password="${req.body.password}" 
      WHERE
        id="${req.body.id}"
    `);
    const user = await db.all(`SELECT * from Users WHERE id="${req.body.id}"`);
    
    res.send(user[0]);
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
    const query = await db.run(`INSERT INTO Tweets (userId, text) values ("${req.body.userId}", "${req.body.text}")`);
    const tweet = await db.all(`SELECT Tweets.id, Tweets.text, Users.name from Tweets INNER JOIN Users ON Users.id=Tweets.userId WHERE Tweets.id=${query.lastID}`);

    res.send(tweet[0]);
  } catch (err) {
    next(err)
  }
});

server.get('/tweets', async (req, res, next) => {
  try {
    const tweets = await db.all(`SELECT Tweets.id, Tweets.text, Users.name from Tweets INNER JOIN Users ON Users.id=Tweets.userId`);

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

server.post('/login', async (req, res, next) => {
  try {
    const user = await db.all(`SELECT * from Users WHERE email="${req.body.email}" AND password="${req.body.password}"`);
    
    res.send(user[0]);
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

