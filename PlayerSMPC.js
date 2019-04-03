const { spawn } = require('child_process')
const EventEmitter = require('events')

const { includeError } = require('./helpers')

const SCALE = process.env.SMPC_ENGINE
const PLAYER_CMD = `${SCALE}/Player.x`

class Player extends EventEmitter {
  constructor (id) {
    super()
    this.player = null
    this.id = id
    this.errors = []
  }

  run () {
    this.player = spawn(PLAYER_CMD, [this.id, 'Programs/sedp', '-f 1'], { cwd: SCALE, shell: true })

    this.player.stdout.on('data', (data) => {
      console.log(data.toString())
      if (data.toString().includes('Opening channel 1')) { // better search message. SCALE should print specilized message
        this.emit('listen', { id: this.id })
      }
    })

    this.player.stderr.on('data', (data) => {
      data = data.toString().toLowerCase()
      if (includeError(data, ['what()', 'aborted'])) {
        this.errors.push(data)
        this.emit('error', { id: this.id, errors: this.errors })
      }
    })

    this.player.on('exit', (code) => {
      console.log(`Player exited with code ${code}`)
      this.emit('exit', { id: this.id, code, errors: this.errors })
      this.player.stdin.pause()
      this.player.kill()
      this.player = null
    })
  }
}

module.exports = Player
