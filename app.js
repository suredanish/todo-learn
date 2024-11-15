const express = require('express')
const cors = require('cors')
const app = express()
const port = 1212
const db = require('./db.json')

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.post('/login', (req, res) => {
    // req.body.username, req.body.password {username: 'danish', password: '123'}
    // const username = req.body.username
    // const password = req.body['password']
    const {username, password} = req.body
    const user = db.users.find(u => u.username == username)
    console.log(user, req.body)
    if(user){
        if(user.password == password) {
            return res.send({token: generateToken(user)})
        }
    }
    res.status(401).send()

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const generateToken = (user) => user.username + user.password + 123123