require('dotenv').config()

const _ = require('lodash')
const WebSocket = require('ws')
const Player = require('./Player')
const { print } = require('./helpers')

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

  ws.on('message', (message) => {
    print(`Message: ${message}`)
    if (message === 'start') {
      player.run()

      player.on('listen', () => {
        ws.send('listen')
      })

      player.on('exit', () => {
        ws.send('exit')
      })
    }
  })
})
