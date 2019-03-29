require('dotenv').config()

const _ = require('lodash')
const WebSocket = require('ws')
const Player = require('./Player')
const { print, pack, unpack } = require('./helpers')

const PORT = process.env.PORT || 3003

if (_.isEmpty(process.env.SMPC_ENGINE)) {
  throw new Error('SMPC Engine absolute path not defined!')
}

if (_.isEmpty(process.env.ID)) {
  throw new Error('Player ID not defined!')
}

const wss = new WebSocket.Server({ port: PORT })
const player = new Player(process.env.ID)

wss.on('connection', (ws) => {
  print('Connection Accepted!')

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
})
