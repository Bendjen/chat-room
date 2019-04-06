const http = require('http');
const STATIC = require('./modules/static')
const CHAT = require('./modules/chat')

const server = http.createServer(function (request, response) {
  STATIC.loadServer(request, response)
})

server.listen(3000, function () {
  console.log("Server listening on  http://localhost:3000")
})

CHAT.listen(server)