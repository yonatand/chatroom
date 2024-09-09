import ChatRoomPage from "@pages/ChatRoomPage";
import LoginPage from "@pages/LoginPage";
import useStore from "@stores/useStore";

const App = () => {
  const username = useStore((store) => store.username);

  return <>{!!username ? <ChatRoomPage /> : <LoginPage />}</>;
};

export default App;
