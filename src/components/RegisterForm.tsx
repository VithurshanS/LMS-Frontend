import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type RegisterFormProps = {
  onBack: () => void;
  onSuccess: () => void;
};

export default function RegisterForm({ onBack, onSuccess }: RegisterFormProps) {
  const { signUp, departments } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default department when departments are available
  useState(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!departmentId) {
      setError('Please select a department');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, fullName, role, departmentId);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      if (role === 'lecturer') {
        alert('Registration successful! Please wait for admin approval before logging in.');
      }
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Register</h2>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'lecturer')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {departments.length === 0 ? (
                <option value="">No departments available</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))
              )}
            </select>
          </div>

          {role === 'lecturer' && (
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm">
              Note: Lecturer accounts require admin approval before you can log in.
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || departments.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded hover:bg-gray-200 transition"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
