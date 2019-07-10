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
const PLAYER_CMD = process.env.NODE_ENV === 'development' ? 'fake_scale.sh' : `${SCALE}/Player.x`
const COMPILE_CMD = `${SCALE}/compile.py`
const PROGRAMS_PATH = `${SCALE}/Programs/dynamic`
const FHE_FACTORIES = process.env.FHE_FACTORIES || 2

class Player extends EventEmitter {
  constructor (id) {
    super()
    this.player = null
    this.compile = null
    this.id = id
    this.errors = []
    this.job = null
    this.output = ''
  }

  setJob (job) {
    this.job = job
  }

  async _compile (dataInfo) {
    await mkdir(`${PROGRAMS_PATH}/${this.job.id}`, { recursive: true })
    let program = await readFile(`./templates/${this.job.algorithm}.mpc`, 'utf8')
    let compiled = _.template(program)
    program = compiled({ ...dataInfo })
    await writeFile(`${PROGRAMS_PATH}/${this.job.id}/${this.job.id}.mpc`, program)
  }

  async compileProgram (dataInfo) {
    try {
      await this._compile(dataInfo)
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.log(e)
        this.emit('error', { id: this.id, errors: [e.message] })
        return
      }
    }

    this.compile = spawn(COMPILE_CMD, [`${PROGRAMS_PATH}/${this.job.id}`], { cwd: SCALE, shell: true, detached: true })

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
      this.terminateCompilation()
    })
  }

  run () {
    const totalClients = this.job.totalClients || 0
    const args = process.env.NODE_ENV === 'development' ? [`-a ${this.job.algorithm}`] : [this.id, `${PROGRAMS_PATH}/${this.job.id}`, `-f ${FHE_FACTORIES}`, `-clients ${totalClients}`]
    const cwd = process.env.NODE_ENV === 'development' ? __dirname : SCALE

    this.player = spawn(PLAYER_CMD, [...args], { cwd, shell: true, detached: true })

    this.player.stdout.on('data', (data) => {
      data = data.toString()
      console.log(data)
      if (data.includes('@')) { // @ mean the server is ready and listening for client connections
        this.emit('listen', { id: this.id })
      }

      if (data.includes('#')) { // # means output start
        this.bufferOutput = true
      }

      if (this.bufferOutput) {
        this.output += data
      }

      if (data.includes('$')) { // $ means output end
        this.bufferOutput = false
        this.output += data
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
      this.emit('exit', { id: this.id, code, errors: this.errors, output: this.output })
      this.terminate()
    })
  }

  terminatePlayer () {
    this._terminate(this.player)
  }

  terminateCompilation () {
    this._terminate(this.compile)
  }

  _terminate (process) {
    if (this.process) {
      this.process.removeAllListeners()
      this.process.stdin.pause()
      try {
        process.kill(-this.process.pid)
      } catch (e) {}
      this.process.kill()
      this.process = null
    }
  }

  terminate () {
    this.terminateCompilation()
    this.terminatePlayer()
    this.job = null
    this.output = ''
  }
}

module.exports = Player
