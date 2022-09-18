const socket = io.connect('https://web-chat-app-socket-io.herokuapp.com/');

const inputNameBox = document.querySelector('#input-name-box');

const usernameInput = document.querySelector('#username-input');

socket.on('connect', () => {
  usernameInput.focus();
});

const userListContainer = document.querySelector('#user-list ul');

socket.on('res-users', (users) => {
  userListContainer.innerHTML = '';
  users.forEach((user) => {
    userListContainer.innerHTML += `<li class='font-semibold border-2 border-black px-2'>${user.name}</li>`;
  });
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
  socket.emit('add-user', username, room);
  socket.emit('create-room', room);
  socket.emit('send-join-notif', username, room);
  textMessageInput.focus();

  return username;
}

const submitNameBtn = document.querySelector('#submit-name-btn');

const roomName = document.querySelector('#room-name');

let username = '';
let room = 'Public';

const textMessageInput = document.querySelector('#message-text');

submitNameBtn.addEventListener('click', (_) => {
  roomName.textContent = room;
  username = submitName(username, room);
});

usernameInput.addEventListener('keypress', (event) => {
  if (event.key == 'Enter') {
    roomName.textContent = room;
    username = submitName(username, room);
  }
});

socket.on('user-found', (username) => {
  alert(`${username} has been used already! Choose another name`);
  window.location.href = 'https://web-chat-app-socket-io.herokuapp.com/';
});

const messageContainer = document.querySelector('#message-container');

function displayNotification(msg) {
  const userNotif = `<p class="bg-black text-white px-2 py-0.5 mb-1">${msg}</p>`;
  messageContainer.innerHTML += userNotif;
  messageContainer.scrollTop = messageContainer.scrollHeight;
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
          <p class="my-0 border-black border-2 px-2 py-0.5 break-words">${message}</p>
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

function joinRoom(username, room) {
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
    socket.emit('new-room', username, oldRoom, room);
    socket.emit('send-join-notif', username, room);
    roomNameInput.value = '';
  }
}

roomNameInput.addEventListener('keypress', (event) => {
  if (event.key == 'Enter') {
    joinRoom(username, room);
  }
});

joinRoomBtn.addEventListener('click', () => {
  joinRoom(username, room);
});

socket.on('join-room-notif', (username, room) => {
  displayNotification(`<b><i>${username}</i></b> has joined the ${room} room`);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on('leave-room-notif', (username) => {
  displayNotification(`<b><i>${username}</i></b> has left this room`);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on('res-disc-username', (username) => {
  displayNotification(`<b><i>${username}</i></b> has disconnected`);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});
