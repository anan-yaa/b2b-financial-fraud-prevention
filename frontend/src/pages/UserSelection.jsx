import React from 'react';
import { useUser } from '../context/UserContext';
import { User, Building, ShoppingCart, Shield, Eye } from 'lucide-react';

const UserSelection = () => {
  const { selectUser } = useUser();

  const userTypes = [
    {
      role: 'VENDOR',
      name: 'Vendor',
      description: 'Upload invoices and track financing status',
      icon: Building,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      role: 'BUYER',
      name: 'Buyer',
      description: 'Verify and approve submitted invoices',
      icon: ShoppingCart,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      role: 'ADMIN',
      name: 'Administrator',
      description: 'Approve financing and process payments',
      icon: Shield,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      role: 'AUDITOR',
      name: 'Auditor',
      description: 'View all invoices and audit trails',
      icon: Eye,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
  ];

  const handleUserSelect = (userType) => {
    const userData = {
      id: `${userType.role.toLowerCase()}_${Date.now()}`,
      name: `${userType.name} User`,
      email: `${userType.role.toLowerCase()}@example.com`,
      role: userType.role,
    };
    selectUser(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Invoice Financing Platform
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to access the dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            return (
              <button
                key={userType.role}
                onClick={() => handleUserSelect(userType)}
                className={`${userType.color} ${userType.hoverColor} text-white rounded-xl p-8 transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-${userType.color}/50`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="bg-white/20 p-4 rounded-full">
                    <Icon size={48} />
                  </div>
                  <h3 className="text-2xl font-bold">{userType.name}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {userType.description}
                  </p>
                  <div className="mt-4 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                    Role: {userType.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            This is a demo environment. Select any role to explore the platform features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
