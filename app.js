const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const fs = require('fs/promises')
const app = express()
const port = 1212
const dbPath = './db.json'
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/login', async (req, res) => {
    // req.body.username, req.body.password {username: 'danish', password: '123'}
    // const username = req.body.username
    // const password = req.body['password']
    const {username, password} = req.body
    const user = (await db()).users.find(u => u.username == username)
    console.log(user, req.body)
    if(user){
        if(user.password == password) {
            return res.send(generateToken(user))
        }
    }
    res.status(401).send()
})

app.post('/signup', async (req, res) => {
  const {username, password} = req.body
  // used (await db()) to wait for file open and we are opening file on every lookup so we can get the lates file
  const user = (await db()).users.find(u => u.username == username)

  if(user) return res.status(409).send('username exists');

  await addUser({username, password: ourHash(password)})
  return res.status(201).send()

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const generateToken = (user) => user.username + user.password + 123123
const ourHash = (s) => crypto.createHash('md5').update(s + 'ourSecret').digest('hex')

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