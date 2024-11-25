const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const fs = require('fs/promises')
const app = express()
const port = 1212
const dbPath = './db.json'
const dbStatic = require(dbPath)
var jwt = require('jsonwebtoken');
const SecKey = 'noSecret123'

// .   | 
//     | 
//     | 
//     | 
//     | 
//     V

app.use(cors({
  origin: 'http://localhost:5500',
  credentials: true
}))
app.use(express.json())


app.post('/signup', async (req, res) => {
  const {username, password} = req.body
  // used (await db()) to wait for file open and we are opening file on every lookup so we can get the lates file
  const user = (await db()).users.find(u => u.username == username)

  if(user!=undefined)
    return res.status(409).send('username exists');

  await addUser({username, password: ourHash(password)})
  
  var token = jwt.sign({"username": username}, SecKey, { expiresIn: '24h' }); // { expiresIn: '1h' }
                                // {"username":"danish"}

            return res.status(201).cookie('token', token, {
              sameSite: 'lax', // for development
              secure: false, // if set to yes the cookie wont be send if request is send via http
              maxAge: 24 * 3600 * 1000
            })
            .send()
  
})


app.post('/login', async (req, res) => {
    // req.body.username, req.body.password {username: 'danish', password: '123'}
    // const username = req.body.username
    // const password = req.body['password']
    //const {username, password} = req.body
    const usernameFromReq=req.body.username
    const passwordFromReq=req.body.password

    const user = (await db()).users.find(u => u.username == usernameFromReq)

    //console.log(user, req.body)
    //console.log(req.headers)

    if(user!=undefined){
        if(user.password == ourHash(passwordFromReq)) {
          var token = jwt.sign({"username": user.username}, SecKey, { expiresIn: '24h' }); // { expiresIn: '1h' }
                                // {"username":"danish"}

            return res.cookie('token', token, {
              sameSite: 'lax', // for development
              secure: false, // if set to yes the cookie wont be send if request is send via http
              maxAge: 24 * 3600 * 1000
            })
            .send()
        }
    }
    res.status(401).send()
})

app.get('/helloworld', (req, res) => {
  res.send('Hello World!')
})

app.use((req, res, next) => {
  const cookie = req.headers.cookie || "";
  // 'token=eyfsafda'
  try{
    const token = cookie.split('=')[1]
    var decodedToken = jwt.verify(token, SecKey);
    // console.log('decodedToken is', decodedToken)
    req.user = decodedToken;
    next()
  }
  catch(ex){
    console.error(ex)
    return res.status(401).send();
  }
})
app.get('/todo', async(req, res) => {
  // req.user??
  const todosOfThisUser = (await db()).todo.filter(t => t.username == req.user.username)
  return res.send(todosOfThisUser)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const generateToken = (user) => user.username + user.password + 123123
//const ourHash = (s) => crypto.createHash('md5').update(s + 'ourSecret').digest('hex')
function ourHash(s){
  return crypto.createHash('md5').update(s + 'ourSecret').digest('hex')
}
//ourHash(123);


const addUser = async (newUser) => {
  // data is a string of charactors, we have to convert it to json next
  const data = await fs.readFile(dbPath, 'utf8');

  const json = JSON.parse(data);

  // Add the new user
  json.users.push(newUser);

  // Write the updated JSON back to the file
  await fs.writeFile(dbPath, JSON.stringify(json, null, 4));
}

const db = async () => {
  const data = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(data)
}

// async function test(){
//   const user = (await db()).users.find(u =>u.username=="danish2");
//   console.log(user)
// }
// test()


