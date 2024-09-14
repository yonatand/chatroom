import ChatRoomPage from "@pages/ChatRoomPage";
import LoginPage from "@pages/LoginPage";
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const App = () => {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (
      readyState !== ReadyState.CONNECTING &&
      readyState !== ReadyState.OPEN
    ) {
      setSocketUrl(null);
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
