import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-gray-900">
            SurveyFlow
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
