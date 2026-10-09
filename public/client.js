
const socket = io();

const login = document.getElementById("login");
const chat = document.getElementById("chat");
const joinForm = document.getElementById("join-form");
const messageForm = document.getElementById("message-form");
const messages = document.getElementById("messages");
const status = document.getElementById("status");

let joined = false;

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!socket.connected) {
    status.textContent = "Connecting to server...";
    return;
  }

  socket.emit("join-room", {
    username: document.getElementById("username").value.trim(),
    room: document.getElementById("room").value.trim()
  });
});

socket.on("joined", ({ username, room }) => {
  joined = true;
  login.hidden = true;
  chat.hidden = false;
  document.getElementById("room-name").textContent =
    "Room: " + room;
  status.textContent = "Connected as " + username;
});

function addMessage(data) {
  const item = document.createElement("div");
  item.className = "message";

  const name = document.createElement("strong");
  name.textContent = data.username;

  const text = document.createElement("div");
  text.textContent = data.message;

  const time = document.createElement("small");
  time.textContent = data.time || "";

  item.append(name, text, time);
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const input = document.getElementById("message");
  const message = input.value.trim();

  if (joined && message) {
    socket.emit("send-message", message);
    input.value = "";
    input.focus();
  }
});

socket.on("receive-message", addMessage);

socket.on("user-joined", (username) => {
  status.textContent = username + " joined the room.";
});

socket.on("user-left", (username) => {
  status.textContent = username + " left the room.";
});

socket.on("disconnect", () => {
  joined = false;
  status.textContent = "Connection lost. Please reconnect.";
});

document.getElementById("leave").addEventListener("click", () => {
  location.reload();
});

socket.on("connect", () => {
  status.textContent = "Connected to server.";
});