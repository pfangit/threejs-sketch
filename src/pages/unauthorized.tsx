import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">403 Forbidden</h1>
        <p className="text-gray-700 mb-6">抱歉，您没有权限访问此页面。</p>
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 inline-block"
          >
            返回首页
          </Link>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium py-2 px-6 rounded-lg transition duration-300 inline-block"
          >
            重新登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
