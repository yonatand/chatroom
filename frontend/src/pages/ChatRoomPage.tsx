import React, { useState } from "react";
import { Drawer, Button, Avatar, List, Badge } from "antd";
import {
  UserOutlined,
  SendOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import useStore from "@stores/useStore";
import Chat from "@features/Chat";
import { SendMessage } from "react-use-websocket";

type props = {
  setSocketUrl: (url: string | null) => void;
  sendMessage: SendMessage;
  lastMessage: MessageEvent<any> | null;
};

const ChatRoomPage: React.FC<props> = ({
  setSocketUrl,
  sendMessage,
  lastMessage,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      user: "Alice",
      content: "Hello everyone!",
      timestamp: "2024-09-08T19:27:57.149Z",
    },
    {
      user: "Bob",
      content: "Hey Alice!",
      timestamp: "2024-09-08T19:27:58.876Z",
    },
    {
      user: "Charlie",
      content: "Good morning!",
      timestamp: "2024-09-09T10:05:42.267Z",
    },
    {
      user: "Alice",
      content: "How are you all?",
      timestamp: "2024-09-09T10:07:12.952Z",
    },
  ]);

  const [username, setUsername] = useStore((store) => [
    store.username,
    store.setUsername,
  ]);

  // Fake users and message history
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  // Handle drawer open/close
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (message) {
      console.log("Message sent:", message);
      sendMessage(message);
      setMessages(
        messages.concat({
          user: username + " (You)",
          content: message,
          timestamp: new Date().toISOString(),
        })
      );
      setMessage(""); // Clear input after sending
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setSocketUrl(null);
    setUsername(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center bg-blue-800 p-4 shadow-lg">
        <h1 className="text-white text-xl font-bold">Chatroom</h1>
        {/* Button with user icon and count */}
        <Badge count={users.length} color="#547ED9" className="select-none">
          <Button
            icon={<UserOutlined />}
            shape="circle"
            type="primary"
            className="bg-blue-600"
            onClick={toggleDrawer}
          />
        </Badge>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        <Chat messages={messages} />
      </main>

      {/* Footer: Message Input and Send Button */}
      <footer className="flex items-center p-4 bg-gray-800 border-t border-gray-600 shrink-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-grow p-2 rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-400"
          placeholder="Type a message..."
        />
        <Button
          icon={<SendOutlined />}
          type="default"
          className="ml-4 h-10 align-middle bg-blue-800 hover:bg-blue-900"
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
        open={drawerVisible}
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
                avatar={<Avatar>{user.name[0]}</Avatar>}
                title={<span className="text-white">{user.name}</span>}
              />
            </List.Item>
          )}
        />

        {/* Disconnect Button */}
        <div className="mt-6 flex justify-center">
          <Button
            type="text"
            danger
            icon={<DisconnectOutlined />}
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default ChatRoomPage;
