import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

/**
 * Application header with logo and user menu
 */
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/dashboard"
            className="text-xl font-bold text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            SurveyFlow
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
