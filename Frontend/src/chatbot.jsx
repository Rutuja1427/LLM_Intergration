import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef();
//scrolling of chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
   // console.log(userMessage);
    

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
    message: input,
  });
  console.log("Bot response:", res.data); // Add this
  const botMessage = { sender: "bot", text: res.data.reply };
  setMessages(prev => [...prev, botMessage]);

    } catch (err) {
  console.error("Axios error:", err.response?.data || err.message);
  const botMessage = { sender: "bot", text: "Failed to get response" };
  setMessages(prev => [...prev, botMessage]);
}


    setInput("");
  };



  return (
    <div style={{ width: "400px", margin: "auto", padding: "20px" }}>
      <h2>LLM Chatbot</h2>

      <div
        ref={chatBoxRef}
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender}:</b> {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ width: "70%", padding: "5px" }}
        placeholder="Type your message..."
        onKeyDown={e => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>
        Send
      </button>
    </div>
  );
}

export default Chatbot;

