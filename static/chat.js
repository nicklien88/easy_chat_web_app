import { updateUserList } from "./users.js";
import { displayMessage } from "./ui.js";

export let socket;
export let username;
export let currentChat = "public"; // "public" 或私聊對象名稱

export function setCurrentChat(newChat) {
    currentChat = newChat;
}

export function joinChat() {
    username = document.getElementById("username").value;
    if (!username) {
        alert("請輸入名稱！");
        return;
    }

    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = function() {
        socket.send(JSON.stringify({ type: "join", username }));
    };

    socket.onmessage = function(event) {
        let msg = JSON.parse(event.data);

        if (msg.type === "userList") {
            updateUserList(msg.users);
        } else if (msg.type === "friendAccepted") {
            alert(msg.text);
        } else {
            displayMessage(msg.username, msg.text);
        }
    };

    document.getElementById("usernameBox").style.display = "none";
    document.getElementById("container").style.display = "flex";
}

export function sendMessage() {
    let message = document.getElementById("message").value;
    if (message) {
        let msgObj = {
            type: currentChat === "public" ? "publicMessage" : "privateMessage",
            username,
            text: message,
            to: currentChat === "public" ? "" : currentChat
        };
        socket.send(JSON.stringify(msgObj));
        document.getElementById("message").value = "";
    }
}

export function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}