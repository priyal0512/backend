import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUpload,
  FiCheckCircle,
  FiFileText,
  FiMessageSquare,
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/uploads', icon: FiUpload, label: 'Uploads' },
    { path: '/validations', icon: FiCheckCircle, label: 'Validations' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
    { path: '/chatbot', icon: FiMessageSquare, label: 'Chatbot' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

