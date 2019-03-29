const PREFIX = `Player WebSocket: ID: ${process.env.ID}: `

const print = (message) => {
  console.log(`${PREFIX}`, message)
}

module.exports = {
  print
}
