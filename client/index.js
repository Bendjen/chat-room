const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('连接上了服务器')
})


socket.on('joinResult', (res) => {
  console.log(`加入了房间${res.room}`)
})

socket.on('message', (res) => {
  console.log(res.text)
})