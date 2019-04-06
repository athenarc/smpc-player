require('dotenv').config()

const _ = require('lodash')
const WebSocket = require('ws')
const Player = require('./PlayerSMPC')
const { print, pack, unpack } = require('./helpers')

const PORT = process.env.PORT || 3003

if (_.isEmpty(process.env.SMPC_ENGINE)) {
  throw new Error('SMPC Engine absolute path not defined!')
}

if (!process.env.ID) {
  throw new Error('Player ID not defined!')
}

const wss = new WebSocket.Server({ port: PORT, clientTracking: true })

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
  })

  ws.on('error', (err) => {
    console.log(err)
  })

  ws.on('message', (data) => {
    print(`Message: ${data}`)
    data = unpack(data)

    if (data.message === 'compile') {
      player.compileProgram({ ...data.mpc })
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
