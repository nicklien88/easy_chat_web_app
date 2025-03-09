export function updateUserList(users) {
    let userListElement = document.getElementById("usernames");
    userListElement.innerHTML = "";

    users.forEach(user => {
        if (user !== username) {
            let li = document.createElement("li");
            li.textContent = user;

            let friendButton = document.createElement("button");
            friendButton.textContent = "加好友";
            friendButton.onclick = function() {
                sendFriendRequest(user);
            };

            let chatButton = document.createElement("button");
            chatButton.textContent = "私聊";
            chatButton.onclick = function() {
                startPrivateChat(user);
            };

            li.appendChild(friendButton);
            li.appendChild(chatButton);
            userListElement.appendChild(li);
        }
    });

    document.getElementById("user-count").textContent = users.length;
}

export function sendFriendRequest(friendName) {
    socket.send(JSON.stringify({ type: "friendRequest", username, to: friendName }));
}

export function startPrivateChat(friendName) {
    currentChat = friendName;
    alert("與 " + friendName + " 私聊中！");
}