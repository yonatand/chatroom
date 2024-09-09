import React, { useState } from "react";
import { Drawer, Button, Avatar, List, Badge } from "antd";
import {
  UserOutlined,
  SendOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./index.css"; // Tailwind

const App: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [message, setMessage] = useState("");

  // Fake users and message history
  const users = [
    { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Charlie", avatar: "https://i.pravatar.cc/150?img=3" },
  ];

  const messages = [
    { user: "Alice", content: "Hello everyone!", timestamp: "10:00 AM" },
    { user: "Bob", content: "Hey Alice!", timestamp: "10:02 AM" },
    { user: "Charlie", content: "Good morning!", timestamp: "10:05 AM" },
    { user: "Alice", content: "How are you all?", timestamp: "10:07 AM" },
  ];

  // Handle drawer open/close
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (message) {
      console.log("Message sent:", message);
      setMessage(""); // Clear input after sending
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    console.log("Disconnected from chat!");
    // Logic for disconnecting the user goes here (e.g., clearing user session or Socket.IO disconnect)
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-700 p-4 shadow-lg">
        <h1 className="text-white text-xl font-bold">Chatroom</h1>
        {/* Button with user icon and count */}
        <Badge count={users.length}>
          <Button
            icon={<UserOutlined />}
            shape="circle"
            type="primary"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={toggleDrawer}
          />
        </Badge>
      </header>

      {/* Main Chat Area */}
      <main className="flex-grow p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 shadow-lg overflow-y-auto h-3/4">
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{msg.user[0]}</Avatar>}
                  title={
                    <span className="text-blue-400 font-semibold">
                      {msg.user}
                    </span>
                  }
                  description={msg.content}
                />
                <div className="text-gray-500">{msg.timestamp}</div>
              </List.Item>
            )}
          />
        </div>
      </main>

      {/* Footer: Message Input and Send Button */}
      <footer className="flex items-center p-4 bg-gray-800 border-t border-gray-600">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400"
          placeholder="Type a message..."
        />
        <Button
          icon={<SendOutlined />}
          type="primary"
          className="ml-4 bg-blue-600 hover:bg-blue-700"
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </footer>

      {/* Drawer for Users */}
      <Drawer
        title="Connected Users"
        placement="right"
        onClose={toggleDrawer}
        visible={drawerVisible}
        bodyStyle={{ backgroundColor: "#1f2937" }}
        drawerStyle={{ backgroundColor: "#111827" }}
        headerStyle={{ color: "white", backgroundColor: "#1f2937" }}
      >
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={user.avatar} />}
                title={<span className="text-white">{user.name}</span>}
              />
            </List.Item>
          )}
        />

        {/* Disconnect Button */}
        <div className="mt-6 flex justify-center">
          <Button
            type="primary"
            danger
            icon={<DisconnectOutlined />}
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default App;
