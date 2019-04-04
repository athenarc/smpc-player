const { spawn } = require('child_process')
const EventEmitter = require('events')
const fs = require('fs')
const util = require('util')
const _ = require('lodash')

const { includeError } = require('./helpers')

const readFile = util.promisify(fs.readFile)
const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)

const SCALE = process.env.SMPC_ENGINE
const PLAYER_CMD = `${SCALE}/Player.x`
const COMPILE_CMD = `${SCALE}/compile.py`
const PROGRAMS_PATH = `${SCALE}/Programs/dynamic`

class Player extends EventEmitter {
  constructor (id) {
    super()
    this.player = null
    this.compile = null
    this.id = id
    this.errors = []
    this.mpc = {}
  }

  async _compile (mpc) {
    await mkdir(`${PROGRAMS_PATH}/${mpc.id}`)
    let program = await readFile(`./templates/${mpc.name}.mpc.mustache`, 'utf8')
    let compiled = _.template(program)
    program = compiled({ dataSize: mpc.dataSize })
    await writeFile(`${PROGRAMS_PATH}/${mpc.id}/${mpc.id}.mpc`, program)
  }

  async compileProgram (mpc) {
    try {
      await this._compile(mpc)
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.log(e)
        this.emit('error', { id: this.id, errors: [e.message] })
        return
      }
    }

    this.mpc = { ...mpc }
    this.compile = spawn(COMPILE_CMD, [`${PROGRAMS_PATH}/${mpc.id}`], { cwd: SCALE, shell: true })

    this.compile.stdout.on('data', (data) => {})

    this.compile.stderr.on('data', (data) => {
      data = data.toString().toLowerCase()
      console.log(data)
      this.errors.push(data)
      this.emit('error', { id: this.id, errors: this.errors })
    })

    this.compile.on('exit', (code) => {
      console.log(`Compilation exited with code ${code}`)
      this.emit('compilation-ended', { id: this.id, code, errors: this.errors })
      this.compile.stdin.pause()
      this.compile.kill()
      this.compile = null
    })
  }

  run () {
    this.player = spawn(PLAYER_CMD, [this.id, `${PROGRAMS_PATH}/${this.mpc.id}`, '-f 1'], { cwd: SCALE, shell: true })

    this.player.stdout.on('data', (data) => {
      console.log(data.toString())
      if (data.toString().includes('Opening channel 1')) { // better search message. SCALE should print specilized message
        this.emit('listen', { id: this.id })
      }
    })

    this.player.stderr.on('data', (data) => {
      console.log(data.toString())
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
