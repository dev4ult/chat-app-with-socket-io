const socket = io.connect('https://web-chat-app-socket-io.herokuapp.com/');

const inputNameBox = document.querySelector('#input-name-box');

const usernameInput = document.querySelector('#username-input');

socket.on('connect', () => {
  usernameInput.focus();
});

function submitName(username, room) {
  username = usernameInput.value;
  if (!username) {
    alert('Please input your name first!');
    return;
  } else if (username.length > 13) {
    alert('Username too long (Max Characters: 13)');
    return;
  }

  inputNameBox.classList.add('hidden');

  displayNotification(`You have joined the ${room} room`);
  socket.emit('create-room', room);
  socket.emit('send-join-notif', username, room);
  textMessageInput.focus();

  return username;
}

const submitNameBtn = document.querySelector('#submit-name-btn');

const roomName = document.querySelector('#room-name');

let username = '';
let room = '';

const textMessageInput = document.querySelector('#message-text');

submitNameBtn.addEventListener('click', (_) => {
  room = 'Public';
  roomName.textContent = room;
  username = submitName(username, room);
});

usernameInput.addEventListener('keypress', (event) => {
  if (event.key == 'Enter') {
    room = 'Public';
    roomName.textContent = room;
    username = submitName(username, room);
  }
});

const messageContainer = document.querySelector('#message-container');

function displayNotification(msg) {
  const userNotif = `<p class="bg-black text-white px-2 py-0.5 mb-1">${msg}</p>`;
  messageContainer.innerHTML += userNotif;
}

function sendMessage(username, message, room) {
  if (!username) {
    alert('Input Your Name First');
    return;
  }

  if (message) {
    messageContainer.appendChild(createBubbleChat(username, message, true));
    socket.emit('send-message', username, message, room);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    textMessageInput.value = '';
  }
}

textMessageInput.addEventListener('keypress', (event) => {
  const message = textMessageInput.value;
  if (event.key == 'Enter') {
    sendMessage(username, message, room);
  }
});

const sendMessageBtn = document.querySelector('#send-message');

// send message
sendMessageBtn.addEventListener('click', (_) => {
  const message = textMessageInput.value;
  sendMessage(username, message, room);
});

// create bubble chat function
function createBubbleChat(username, message, senderSide) {
  const bubbleChat = document.createElement('div');
  bubbleChat.classList.add('bubble-chat');
  bubbleChat.classList.add('mb-2');
  bubbleChat.classList.add('max-w-[200px]');
  bubbleChat.classList.add('w-fit');

  let alignUsername = '';
  let user = username;
  if (senderSide) {
    user = 'You';
    alignUsername = 'text-right';
    bubbleChat.classList.add('ml-auto');
  }

  bubbleChat.innerHTML = `
          <p class="text-sm  ${alignUsername}">${user}</p>
          <p class="my-0 border-black border-2 px-2 py-0.5 ">${message}</p>
        `;

  return bubbleChat;
}

// broadcast message
socket.on('receive-message', (username, message) => {
  messageContainer.appendChild(createBubbleChat(username, message));
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

const roomNameInput = document.querySelector('#room-name-input');
const joinRoomBtn = document.querySelector('#join-room-btn');

joinRoomBtn.addEventListener('click', () => {
  if (!username) {
    alert('Please input your name first');
    return;
  }

  const oldRoom = room;
  room = roomNameInput.value;

  if (room.length > 10) {
    alert('Room Name too long (Max Characters: 10)');
    return;
  }

  if (room) {
    roomName.textContent = room;
    displayNotification(`You have joined the ${room} room`);
    socket.emit('new-room', oldRoom, room);
    socket.emit('send-join-notif', username, room);
    roomNameInput.value = '';
  }
});

socket.on('join-room-notif', (username, room) => {
  displayNotification(`<b><i>${username}</i></b> has joined the ${room} room`);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
