import { Button, Result } from "antd";
import { useRouteError } from "react-router";
import { Link } from "react-router-dom";

const Exception500 = () => {
  const error = useRouteError();
  console.log("Exception500", error);
  return (
    <Result
      status="500"
      title="500"
      style={{
        background: "none",
      }}
      subTitle="Sorry, the server is reporting an error."
      extra={
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  );
};

export default Exception500;
