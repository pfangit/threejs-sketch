import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const Exception403 = () => {
  return (
    <Result
      status="403"
      title="403"
      style={{
        background: "none",
      }}
      subTitle="Sorry, you don't have access to this page."
      extra={
        <Link to="/">
          <Button type="primary">Back to home</Button>
        </Link>
      }
    />
  );
};

export default Exception403;
