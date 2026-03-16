import { Link } from "react-router-dom";

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          About Our Application
        </h1>

        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-gray-600 mb-4">
            This is a modern React application built with Vite, TypeScript, and
            Tailwind CSS. It demonstrates best practices for building scalable
            web applications.
          </p>

          <p className="text-gray-600 mb-4">
            Key features of our application include:
          </p>

          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Fast development with Vite</li>
            <li>Type safety with TypeScript</li>
            <li>Modern styling with Tailwind CSS</li>
            <li>Client-side routing with React Router</li>
            <li>Code splitting and lazy loading</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4">
            We aim to provide developers with a solid foundation for building
            modern web applications with excellent performance and
            maintainability.
          </p>
        </div>

        <div className="flex justify-center py-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
