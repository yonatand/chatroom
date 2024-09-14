import React, { useEffect, useState } from "react";
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

type Props = {
  setSocketUrl: (url: string | null) => void;
  sendMessage: SendMessage;
  lastMessage: MessageEvent<any> | null;
};

export type Message =
  | {
      user: string;
      content: string;
      timestamp: string;
      type?: "USER";
    }
  | {
      content: string;
      type: "SYSTEM";
    };

const ChatRoomPage: React.FC<Props> = ({
  setSocketUrl,
  sendMessage,
  lastMessage,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const username = useStore((store) => store.username);

  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!lastMessage) return;
    const receivedMessage = JSON.parse(lastMessage.data);
    switch (receivedMessage.event) {
      case "login":
        setUsers(users.concat(receivedMessage.username));
        setMessages(
          messages.concat({
            content: `${receivedMessage.username} has logged in!`,
            type: "SYSTEM",
          })
        );
        break;
      case "logout":
        setUsers(
          users.filter(
            (oldUsername) => oldUsername !== receivedMessage.username
          )
        );
        setMessages(
          messages.concat({
            content: `${receivedMessage.username} has logged out :(`,
            type: "SYSTEM",
          })
        );
        break;
      case "message":
        setMessages(
          messages.concat({
            user:
              username === receivedMessage.username
                ? username + " (You)"
                : receivedMessage.username,
            content: receivedMessage.data,
            timestamp: receivedMessage.time,
          })
        );
        break;
      case "userList":
        setUsers(receivedMessage.data);
        break;
    }
  }, [lastMessage]);

  // Handle drawer open/close
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (message) {
      console.log("Message sent:", message);
      sendMessage(JSON.stringify({ event: "message", data: message }));
      setMessage(""); // Clear input after sending
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    setSocketUrl(null);
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
                avatar={<Avatar>{user[0]}</Avatar>}
                title={<span className="text-white">{user}</span>}
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
