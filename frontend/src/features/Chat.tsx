import { Message } from "@pages/ChatRoomPage";
import { Avatar, List } from "antd";
import { useEffect, useRef } from "react";

const Chat = ({ messages }: { messages: Message[] }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
      <List
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(msg) => {
          if (!msg.type || msg.type === "USER") {
            return (
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
            );
          } else if (msg.type === "SYSTEM") {
            return (
              <List.Item>
                <div className="text-gray-500 ml-auto mr-auto">
                  {msg.content}
                </div>
              </List.Item>
            );
          }
        }}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;
