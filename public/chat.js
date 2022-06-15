console.log('chat.js file loaded!')

var socket = io()
var username = document.currentScript.getAttribute('userDetails');

const chat = document.getElementById('chat-form')
const input = document.getElementById('chat-input')
const chatPanel = document.getElementById('chat-panel')
//const user = document.currentScript.getAttribute('userDetails');


socket.emit("new-user-joined", username);

socket.on('user-connected', (socket_name) => {
    console.log('user-connected')
    userJoinLeft(socket_name, 'joined');
});

function userJoinLeft(name, status) {
    console.log('Joined');
    let div = document.createElement('div');
    div.classList.add('user-join');
   
    let content = `<p><b>${name}</b> has ${status} the chat</p>`;
    div.innerHTML=content;
    chatPanel.appendChild(div);
}

socket.on('user-disconnected', (user) => {
    console.log('user-disconnected')
    userJoinLeft(user, 'left');
});




chat.addEventListener('submit', event => {
    event.preventDefault()
    let data = {
        user : username,
        msg: input.value
    }

    if(input.value !== '') {
        renderMessage(data, 'outgoing');
        socket.emit('message', data)
        input.value='';
    }


})



function renderMessage(data, status) {
    const div = document.createElement('div')
    div.classList.add(`message-${status}`)

    let content = `
    <small>${data.user}</small> 
    <p>${data.msg}</p>`;
    div.innerHTML = content;
    chatPanel.appendChild(div)    
}

socket.on('message', (data) => {
    renderMessage(data, 'incoming')
})