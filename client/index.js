



new Vue({
    el: '#app',
    data: function () {
        return {
            username: '',
            willSendMessage: '',
            messageList: [],
            socket: null,
        }
    },
    mounted() {
        this.socket = io('http://localhost:3000');

        this.socket.on('connect', () => {
            document.getElementById('textarea').addEventListener('keydown', (event) => {
                if (event.keyCode == 13) {
                    event.preventDefault()
                    this.sendMessage()
                }
            })
            this.socket.on('nameResult', (res) => {
                if (res.success) {
                    this.username = res.name
                } else {
                    this.$alert(res.message, '提示')
                }
            })

            this.socket.on('join', (res) => {
                this.messageList.push(res)
            })

            this.socket.on('message', (res) => {
                this.messageList.push(res)
                this.$nextTick(() => {
                    this.scrollIntoView()
                })
            })
        })
    },
    methods: {
        scrollIntoView() {
            const domList = document.getElementsByClassName('messageLine')
            domList[domList.length - 1].scrollIntoView()
        },
        sendMessage() {
            if (this.willSendMessage !== '') {
                this.socket.emit('message', {
                    room: 'DEFAULT',
                    text: this.willSendMessage
                }, () => {
                    this.messageList.push({
                        sender: this.username,
                        text: this.willSendMessage
                    })
                    this.willSendMessage = ''
                    this.$nextTick(() => {
                        this.scrollIntoView()
                    })
                })
            }
        },
        changeName() {
            const previousName = this.username
            this.$prompt('请输入新的名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                this.socket.emit('nameAttempt', { name: value }, () => {
                    this.messageList.push({ sender: 'system', text: '您已更名为 ' + value })
                    this.messageList = this.messageList.map(item => {
                        if (item.sender == previousName) {
                            return { ...item, sender: value }
                        } else {
                            return item
                        }
                    })
                })
            })
        }
    },
})

