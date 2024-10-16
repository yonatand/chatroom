import useStore from "@stores/useStore";
import { Button, Form, Input, Typography } from "antd";
import { UserOutlined, LinkOutlined } from "@ant-design/icons";
import useLocalStorage from "@hooks/useLocalStorage";
const { Title } = Typography;

type Props = {
  setSocketUrl: (url: string | null) => void;
};

type FormProps = {
  defaultUsername: string | null;
  defaultPort: number | null;
};

const LoginPage = ({ setSocketUrl }: Props) => {
  const [{ defaultUsername, defaultPort }, setDefaultFormProps] =
    useLocalStorage<FormProps>("formProps", {
      defaultUsername: null,
      defaultPort: null,
    });
  const [username, setUsername] = useStore((store) => [
    store.username,
    store.setUsername,
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 items-center justify-center">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-lg">
        <Title level={2} className="text-white text-center mb-6">
          Login
        </Title>
        <Form
          name="login"
          initialValues={{
            username: username || defaultUsername,
            port: defaultPort,
          }}
          onFinish={(form) => {
            setUsername(form.username);
            setDefaultFormProps({
              defaultUsername: form.username,
              defaultPort: form.port,
            });
            setSocketUrl(`ws://localhost:${form.port}`);
          }}
          className="space-y-4"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              className="bg-gray-700 text-white border-gray-600"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item
            name="port"
            rules={[{ required: true, message: "Please input your port!" }]}
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="Port"
              className="bg-gray-700 text-white border-gray-600"
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
