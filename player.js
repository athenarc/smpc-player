require('dotenv').config()

const _ = require('lodash')
const WebSocket = require('ws')
const Player = require('./PlayerSMPC')
const { print, pack, unpack } = require('./helpers')

const PORT = process.env.PORT || 3003

if (_.isEmpty(process.env.SMPC_ENGINE)) {
  throw new Error('SMPC Engine absolute path not defined!')
}

if (_.isEmpty(process.env.ID)) {
  throw new Error('Player ID not defined!')
}

const wss = new WebSocket.Server({ port: PORT, clientTracking: true })

const handleConnection = (ws) => {
  const player = new Player(process.env.ID)

  ws.on('close', (data) => {
    console.log('Connection Closed: ', data)
  })

  ws.on('error', (err) => {
    console.log(err)
  })

  ws.on('message', (data) => {
    print(`Message: ${data}`)
    data = unpack(data)

    if (data.message === 'start') {
      player.run()

      player.on('listen', () => {
        ws.send(pack({ message: 'listen', player: { id: player.id } }))
      })

      player.on('exit', () => {
        ws.send(pack({ message: 'exit', player: { id: player.id } }))
      })
    }
  })
}

wss.on('connection', (ws) => {
  print('Connection Accepted!')
  handleConnection(ws)
})
