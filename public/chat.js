console.log('chat.js file loaded!')

var socket = io()
var username = document.currentScript.getAttribute('userName');

const chat = document.getElementById('chat-form')
const input = document.getElementById('chat-input')
const chatPanel = document.getElementById('chat-panel')
const userID = document.currentScript.getAttribute('userID');
const roomID = document.currentScript.getAttribute('roomID')
console.log(roomID)

socket.emit('new-user-joined', roomID, userID);

socket.on('user-connected', (socket_name) => {
    console.log('user-connected')
    //userJoinLeft(socket_name, 'joined');
});

function userJoinLeft(name, status) {
    console.log('Joined');
    let div = document.createElement('div');
    div.classList.add('user-join');

    let content = `<p><b>${name}</b> has ${status} the chat</p>`;
    div.innerHTML = content;
    chatPanel.appendChild(div);
    chatPanel.scrollTop = chatPanel.scrollHeight;
}


socket.on('user-disconnected', (user) => {
    console.log('user-disconnected')
    //userJoinLeft(user, 'left');
});


chat.addEventListener('submit', event => {
    event.preventDefault()
    let data = {
        username: username,
        userID: userID,
        msg: input.value
    }

    if (input.value !== '') {
        renderMessage(data, 'outgoing');
        socket.emit('message', roomID, data)
        input.value = '';
    }
    
})



function renderMessage(data, status) {
    const div = document.createElement('div')
    div.classList.add(`message-${status}`)

    let content = `
    <small>${data.username}</small> 
    <p>${data.msg}</p>`;
    div.innerHTML = content;
    chatPanel.appendChild(div);
    chatPanel.scrollTop = chatPanel.scrollHeight;
}

socket.on('message', (data) => {
    renderMessage(data, 'incoming')
})

socket.on('chat-history', (res) => {
    for (var i in res) {
        console.log(res[i])
        let data = {
            username: res[i].senderName,
            userID: res[i].senderID,
            msg: res[i].message
        }

        if (res[i].roomID == roomID) {
            if (data.userID == userID) {
                console.log('outgoing')
                renderMessage(data, 'outgoing');
            } else {
                console.log('incoming')
                renderMessage(data, 'incoming');
            }
        }
    }
})