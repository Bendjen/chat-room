



new Vue({
    el: '#app',
    data: function () {
        return {
            username: '',
            willSendMessage: '',
            messageList: []
        }
    },
    mounted() {
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            document.getElementById('textarea').addEventListener('keydown', (event) => {
                if (event.keyCode == 13) {
                    event.preventDefault()
                    if (this.willSendMessage !== '') {
                        socket.emit('message', {
                            room: 'Lobby',
                            text: this.willSendMessage
                        }, () => {
                            this.messageList.push({
                                sender: this.username,
                                text: this.willSendMessage
                            })
                            this.willSendMessage = ''
                        })
                    }

                }
            })
            socket.on('init', (res) => {
                this.username = res.name
            })

            socket.on('join', (res) => {
                this.messageList.push(res)
            })

            socket.on('message', (res) => {
                this.messageList.push(res)
            })
        })



    },
})

