const Protocol = require('./Protocol')
const Player = require('../PlayerSMPC')
const { print, pack, unpack } = require('../helpers')

class SMPC extends Protocol {
  constructor ({ ws }) {
    super({ ws })
    this.player = new Player(process.env.ID)
    this._registerToPlayer()
  }

  _registerToPlayer () {
    this.player.on('compilation-ended', (msg) => {
      this.ws.send(pack({ message: 'compilation-ended', ...msg }))
    })

    this.player.on('listen', () => {
      this.ws.send(pack({ message: 'listen', player: { id: this.player.id } }))
    })

    this.player.on('error', (msg) => {
      this.ws.send(pack({ message: 'error', ...msg }))
    })

    this.player.on('exit', (msg) => {
      this.ws.send(pack({ message: 'exit', entity: 'player', ...msg }))
    })
  }

  handleOpen ({ ws }) {
    console.log('Connection opened.')
  }

  handleClose ({ ws, code, reason }) {
    console.log(`Connection closed with code ${code} and reason ${reason}.`)
    this.player.terminate()
    this.player.removeAllListeners()
  }

  handleError ({ ws, err }) {
    console.log(err)
    this.player.terminate()
    this.player.removeAllListeners()
  }

  handleMessage ({ ws, msg }) {
    print(`Message: ${msg}`)
    msg = unpack(msg)

    if (msg.message === 'job-info') {
      this.player.setJob({ ...msg.job })
    }

    if (msg.message === 'compile') {
      this.player.compileProgram({ ...msg.dataInfo, clients: msg.job.totalClients })
    }

    if (msg.message === 'start') {
      this.player.run()
    }

    if (msg.message === 'restart') {
      this.player.terminate()
    }
  }
}

module.exports = SMPC
