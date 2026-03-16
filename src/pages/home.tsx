import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Our Application
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern React application with Tailwind CSS
        </p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-6">
            This is the home page of our application. You can navigate to other
            pages using the menu above.
          </p>

          <div className="flex justify-center">
            <Link
              to="/about"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Feature 1
            </h3>
            <p className="text-gray-600">
              Description of the first feature of our application.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Feature 2
            </h3>
            <p className="text-gray-600">
              Description of the second feature of our application.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Feature 3
            </h3>
            <p className="text-gray-600">
              Description of the third feature of our application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
