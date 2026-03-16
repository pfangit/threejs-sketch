import { Button, Result } from "antd";
import { Link } from "react-router-dom";

const Exception404 = () => {
  return (
    <Result
      status="404"
      title="404"
      style={{
        background: "none",
      }}
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
};
export default Exception404;
