import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import FraudTesting from './FraudTesting';

const Layout = ({ children }) => {
  const { user, logout, selectUser } = useUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [activeSection, setActiveSection] = useState('main');

  const roles = ['ADMIN', 'VENDOR', 'BUYER', 'AUDITOR'];

  const handleRoleChange = (newRole) => {
    const userData = {
      id: `${newRole.toLowerCase()}_${Date.now()}`,
      name: `${newRole} User`,
      email: `${newRole.toLowerCase()}@example.com`,
      role: newRole,
    };
    selectUser(userData);
    setShowUserSelector(false);
    setActiveSection('main');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: true,
    },
  ];

  const getRoleSpecificMenuItems = () => {
    switch (user?.role) {
      case 'VENDOR':
        return [
          { icon: FileText, label: 'My Invoices', active: false },
        ];
      case 'BUYER':
        return [
          { icon: FileText, label: 'Pending Verification', active: false },
        ];
      case 'ADMIN':
        return [
          { icon: FileText, label: 'Invoice Management', active: false },
          { icon: Building, label: 'Vendor Management', active: false },
          { icon: Users, label: 'User Management', active: false },
        ];
      case 'AUDITOR':
        return [
          { icon: FileText, label: 'Audit Trail', active: false },
        ];
      default:
        return [];
    }
  };

  const allMenuItems = [...menuItems, ...getRoleSpecificMenuItems()];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">InvoiceFin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {allMenuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href="#"
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.active
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              
              {/* User Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
                >
                  <span className="text-sm font-medium">{user?.role}</span>
                  <ChevronDown size={16} />
                </button>
                
                {showUserSelector && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            user?.role === role ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Fraud Testing Button */}
              <button
                onClick={() => setActiveSection(activeSection === 'fraud' ? 'main' : 'fraud')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === 'fraud'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <AlertTriangle size={16} className="mr-2" />
                Fraud Testing
              </button>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {activeSection === 'fraud' ? (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <FraudTesting />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
