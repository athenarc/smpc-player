require('dotenv').config()

const _ = require('lodash')
const https = require('https')
const fs = require('fs')
const WebSocket = require('ws')
const Player = require('./PlayerSMPC')
const { print, pack, unpack } = require('./helpers')

const PORT = process.env.PORT || 3003

if (_.isEmpty(process.env.ROOT_CA)) {
  throw new Error('HTTPS root CA path must be defined!')
}

if (_.isEmpty(process.env.PEM_KEY)) {
  throw new Error('HTTPS key path must be defined!')
}

if (_.isEmpty(process.env.PEM_CERT)) {
  throw new Error('HTTPS cert path must be defined!')
}

if (_.isEmpty(process.env.SMPC_ENGINE)) {
  throw new Error('SMPC Engine absolute path not defined!')
}

if (!process.env.ID) {
  throw new Error('Player ID not defined!')
}

const server = https.createServer({
  ca: fs.readFileSync(process.env.ROOT_CA, { encoding: 'utf-8' }),
  cert: fs.readFileSync(process.env.PEM_CERT),
  key: fs.readFileSync(process.env.PEM_KEY),
  requestCert: true,
  rejectUnauthorized: true,
  port: PORT,
  clientTracking: true
})

const wss = new WebSocket.Server({ server })

console.log(`Player ${process.env.ID} started on port ${PORT}.`)

const handleConnection = (ws) => {
  const player = new Player(process.env.ID)

  player.on('compilation-ended', (msg) => {
    ws.send(pack({ message: 'compilation-ended', ...msg }))
  })

  player.on('listen', () => {
    ws.send(pack({ message: 'listen', player: { id: player.id } }))
  })

  player.on('error', (msg) => {
    ws.send(pack({ message: 'error', ...msg }))
  })

  player.on('exit', (msg) => {
    ws.send(pack({ message: 'exit', entity: 'player', ...msg }))
  })

  ws.on('close', (data) => {
    console.log('Connection Closed: ', data)
    player.terminate()
    player.removeAllListeners()
  })

  ws.on('error', (err) => {
    console.log(err)
    player.terminate()
    player.removeAllListeners()
  })

  ws.on('message', (data) => {
    print(`Message: ${data}`)
    data = unpack(data)

    if (data.message === 'job-info') {
      player.setJob({ ...data.job })
    }

    if (data.message === 'compile') {
      player.compileProgram({ ...data.dataInfo })
    }

    if (data.message === 'start') {
      player.run()
    }

    if (data.message === 'restart') {
      player.terminate()
    }
  })
}

wss.on('connection', (ws) => {
  print('Connection Accepted!')
  handleConnection(ws)
})

server.listen(process.env.PORT)
