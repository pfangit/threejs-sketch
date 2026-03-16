import { useRequest } from "alova/client";
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Form,
  Input,
  Tabs,
  Typography,
} from "antd";
import QRCode from "antd/es/qrcode";
import { Lock, QrCode, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { request } from "@/request.tsx";

const { Title, Text } = Typography;

type LoginForm = {
  username: string;
  password: string;
};

const Login = () => {
  const [activeTab, setActiveTab] = useState("account");
  const location = useLocation();
  const navigator = useNavigate();

  // 获取登录前的完整地址（包括查询参数）
  // 如果没有来源地址或者来源地址就是登录页，则默认跳转到首页
  const from =
    (location.state as { from?: string })?.from ||
    location.pathname + location.search ||
    "/";

  const { loading, send } = useRequest(request.Post("/api/auth/login", {}), {
    immediate: false, // 手动发送，提交数据
  }).onSuccess((event) => {
    console.log(event.data); // 当前请求的响应数据
    // 模拟保存cookie
    localStorage.setItem(
      "token",
      (event.data as unknown as { token: string }).token,
    );
    // 登录成功后跳转回登录前的地址
    if (from.startsWith("/login")) {
      navigator("/", { replace: true });
    } else {
      navigator(from, { replace: true });
    }
  });

  const onFinish = (values: LoginForm) => {
    send(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md rounded-xl shadow-2xl bg-white/90 backdrop-blur-lg">
        <div className="text-center mb-6">
          <Title level={2} className="mb-2 text-gray-800">
            Welcome Back
          </Title>
          <Text type="secondary" className="text-gray-600">
            Please enter your details to sign in
          </Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "account",
              label: (
                <div className="flex items-center">
                  <UserRound size={16} className="mr-2" />
                  Account Login
                </div>
              ),
              children: (
                <Form<LoginForm>
                  name="login"
                  initialValues={{ remember: true }}
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Username!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserRound className="text-gray-400" />}
                      placeholder="Enter your username"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<Lock className="text-gray-400" />}
                      type="password"
                      placeholder="Enter your password"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Flex justify="space-between" align="center">
                      <Form.Item
                        name="remember"
                        valuePropName="checked"
                        noStyle
                      >
                        <Checkbox>Remember me</Checkbox>
                      </Form.Item>
                      <a
                        href=""
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Forgot password?
                      </a>
                    </Flex>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      block
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={loading}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 border-none font-medium hover:from-blue-600 hover:to-purple-700 rounded-lg"
                    >
                      Sign In
                    </Button>

                    <div className="text-center mt-6 text-sm">
                      <Text type="secondary">Don't have an account?</Text>{" "}
                      <a href="" className="text-blue-500 hover:text-blue-700">
                        Sign up
                      </a>
                    </div>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "qr",
              label: (
                <div className="flex items-center">
                  <QrCode size={16} className="mr-2" />
                  QR Code Login
                </div>
              ),
              children: (
                <div className="flex flex-col items-center">
                  <QRCode
                    value="https://example.com/login"
                    size={200}
                    icon="/vite.svg"
                  />
                  <div className="flex flex-col mt-4">
                    <Text strong className="text-center">
                      Scan QR code with your mobile app
                    </Text>
                    <Text type="secondary" className="text-center mt-1">
                      Open the app and scan the QR code to log in automatically
                    </Text>
                  </div>
                  <div className="mt-4">
                    <Button type="link" onClick={() => setActiveTab("account")}>
                      Use account login instead
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
