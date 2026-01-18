import { useAuth } from '../hooks/useAuth';

/**
 * Dashboard page for authenticated users (placeholder)
 */
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600">
        Welcome, {user?.github_username || 'User'}! Your surveys will appear here.
      </p>
    </div>
  );
}
