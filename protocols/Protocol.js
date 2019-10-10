const Player = require('../PlayerSMPC')

class Protocol {
  constructor ({ ws }) {
    if (new.target === Protocol) {
      throw new TypeError('Cannot construct abstract Protocol instances directly')
    }

    this.ws = ws
    this.player = new Player(process.env.ID)
    this._init()
    this._registerToPlayer()
  }

  _init () {
    // connection errors are handle on ws.on('error')
    this.ws.on('open', () => this.handleOpen({ ws: this.ws }))

    this.ws.on('close', (code, reason) => this.handleClose({ ws: this.ws, code, reason }))

    this.ws.on('error', (err) => this.handleError({ ws: this.ws, err }))

    this.ws.on('message', (msg) => this.handleMessage({ ws: this.ws, msg }))
  }

  _registerToPlayer () {
    this.player.on('compilation-ended', msg => this.handlePlayerCompilationEnd(msg))

    this.player.on('listen', () => this.handlePlayerListen())

    this.player.on('error', msg => this.handlePlayerError(msg))

    this.player.on('exit', msg => this.handlePlayerExit(msg))
  }

  /* Abstract Methods */
  handlePlayerCompilationEnd (msg) {
    throw new Error('handlePlayerCompilationEnd: Implementation Missing!')
  }

  handlePlayerListen () {
    throw new Error('handlePlayerListen: Implementation Missing!')
  }

  handlePlayerError (msg) {
    throw new Error('handlePlayerError: Implementation Missing!')
  }

  handlePlayerExit (msg) {
    throw new Error('handlePlayerExit: Implementation Missing!')
  }

  handleOpen ({ ws }) {
    throw new Error('handleOpen: Implementation Missing!')
  }

  handleClose ({ ws, code, reason }) {
    throw new Error('handleClose: Implementation Missing!')
  }

  handleError ({ ws, err }) {
    throw new Error('handleError: Implementation Missing!')
  }

  handleMessage ({ ws, msg }) {
    throw new Error('handleMessage: Implementation Missing!')
  }
}

module.exports = Protocol
