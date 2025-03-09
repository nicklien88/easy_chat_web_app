export function displayMessage(sender, text) {
    let chatbox = document.getElementById("chatbox");
    let messageContainer = document.createElement("div");
    let messageDiv = document.createElement("div");

    messageDiv.textContent = text;
    messageDiv.style.padding = "10px";
    messageDiv.style.borderRadius = "10px";
    messageDiv.style.margin = "5px 0";
    messageDiv.style.maxWidth = "70%";

    if (sender === username) {
        messageContainer.style.textAlign = "right";
        messageDiv.style.backgroundColor = "#DCF8C6";
    } else {
        messageContainer.style.textAlign = "left";
        messageDiv.style.backgroundColor = "#E0E0E0";

        let usernameSpan = document.createElement("span");
        usernameSpan.style.fontSize = "12px";
        usernameSpan.style.color = "#666";
        usernameSpan.textContent = sender + "：";
        messageContainer.appendChild(usernameSpan);
    }

    messageContainer.appendChild(messageDiv);
    chatbox.appendChild(messageContainer);
    chatbox.scrollTop = chatbox.scrollHeight;
}