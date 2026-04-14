import React, { useState } from 'react';
import { vendorAPI, buyerAPI } from '../utils/api';
import { Building, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(false);
  
  // Setup Network Forms
  const [vendorForm, setVendorForm] = useState({
    vendorId: '',
    name: '',
    maxLimit: '',
    authorizedWallet: '',
  });

  const [buyerForm, setBuyerForm] = useState({
    buyerId: '',
    name: '',
    authorizedWallet: '',
  });
  
  // Financial Actions removed: moved to Vendor/Buyer panels per plan

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorForm.vendorId || !vendorForm.name || !vendorForm.maxLimit || !vendorForm.authorizedWallet) {
      toast.error('Please fill all vendor fields');
      return;
    }
    
    try {
      setLoading(true);
      await vendorAPI.registerVendor(vendorForm);
      toast.success('Vendor created successfully!');
      setVendorForm({ vendorId: '', name: '', maxLimit: '', authorizedWallet: '' });
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerSubmit = async (e) => {
    e.preventDefault();
    if (!buyerForm.buyerId || !buyerForm.name || !buyerForm.authorizedWallet) {
      toast.error('Please fill all buyer fields');
      return;
    }

    try {
      setLoading(true);
      await buyerAPI.registerBuyer(buyerForm);
      toast.success('Buyer created successfully!');
      setBuyerForm({ buyerId: '', name: '', authorizedWallet: '' });
    } catch (error) {
      console.error('Error creating buyer:', error);
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'setup'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Building size={18} className="mr-2" />
              Setup Network
            </div>
          </button>
          {/* Financial Actions tab removed - moved to Vendor/Buyer panels */}
        </nav>
      </div>

      {/* Setup Network Tab */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
            {/* Create Vendor Form */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Building size={20} className="mr-2 text-blue-600" />
                Create Vendor
              </h3>
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
                  <input
                    type="text"
                    value={vendorForm.vendorId}
                    onChange={(e) => setVendorForm({...vendorForm, vendorId: e.target.value})}
                    className="input-field"
                    placeholder="VEND_CA_FINAL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                    className="input-field"
                    placeholder="Ananyaa Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Limit</label>
                  <input
                    type="number"
                    value={vendorForm.maxLimit}
                    onChange={(e) => setVendorForm({...vendorForm, maxLimit: e.target.value})}
                    className="input-field"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Wallet</label>
                  <input
                    type="text"
                    value={vendorForm.authorizedWallet}
                    onChange={(e) => setVendorForm({...vendorForm, authorizedWallet: e.target.value})}
                    className="input-field"
                    placeholder="0xABC123"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Create Vendor'}
                </button>
              </form>
            </div>

            {/* Create Buyer Form */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Building size={20} className="mr-2 text-indigo-600" />
                Create Buyer
              </h3>
              <form onSubmit={handleBuyerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer ID</label>
                  <input
                    type="text"
                    value={buyerForm.buyerId}
                    onChange={(e) => setBuyerForm({...buyerForm, buyerId: e.target.value})}
                    className="input-field"
                    placeholder="BUYER_001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={buyerForm.name}
                    onChange={(e) => setBuyerForm({...buyerForm, name: e.target.value})}
                    className="input-field"
                    placeholder="Buyer Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Wallet</label>
                  <input
                    type="text"
                    value={buyerForm.authorizedWallet}
                    onChange={(e) => setBuyerForm({...buyerForm, authorizedWallet: e.target.value})}
                    className="input-field"
                    placeholder="0xABC123"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Create Buyer'}
                </button>

                
              </form>
            </div>
          </div>

          
        </div>
      )}

      {/* Financial actions moved out of AdminPanel */}
    </div>
  );
};

export default AdminPanel;
