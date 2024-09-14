import ChatRoomPage from "@pages/ChatRoomPage";
import LoginPage from "@pages/LoginPage";
import useStore from "@stores/useStore";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const App = () => {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  const username = useStore((store) => store.username);

  useEffect(() => {
    if (
      readyState !== ReadyState.CONNECTING &&
      readyState !== ReadyState.OPEN
    ) {
      setSocketUrl(null);
    }
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({ event: "login", username: username }));
    }
  }, [readyState]);

  return (
    <>
      {readyState === ReadyState.OPEN ? (
        <ChatRoomPage
          setSocketUrl={setSocketUrl}
          sendMessage={sendMessage}
          lastMessage={lastMessage}
        />
      ) : (
        <LoginPage setSocketUrl={setSocketUrl} />
      )}
    </>
  );
};

export default App;
