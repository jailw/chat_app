import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

// keep a single socket instance
const socket = io("http://localhost:3000", { autoConnect: false });

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    // connect once
    socket.connect();

    const onChatMessage = (payload) => {
      setChat((prev) => [...prev, payload]);
    };

    socket.on("chat_message", onChatMessage);

    return () => {
      // IMPORTANT: remove listeners to avoid duplicates in React 18 StrictMode
      socket.off("chat_message", onChatMessage);
    };
  }, []);

  useEffect(() => {
    // auto-scroll to bottom on new messages
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [chat]);

  const joinChat = () => {
    const name = username.trim();
    if (!name) return;
    socket.emit("join", name);
    setJoined(true);
  };

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    socket.emit("send_message", text);
    setMessage("");
  };

  return (
    <div className="container">
      <h2>💬 Group Chat</h2>

      {!joined ? (
        <div className="join-section">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinChat}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-section">
          <div className="chat-log" ref={logRef}>
            <ul>
              {chat.map((c, i) => {
                const isSystem = c.type === "system";
                const isMe = c.senderId && c.senderId === socket.id;
                const rowClass = isSystem
                  ? "row system"
                  : isMe
                  ? "row me"
                  : "row other";
                return (
                  <li key={i} className={rowClass}>
                    <div className="bubble">
                      {!isSystem && <div className="sender">{c.from}</div>}
                      <div className="text">{c.message}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
