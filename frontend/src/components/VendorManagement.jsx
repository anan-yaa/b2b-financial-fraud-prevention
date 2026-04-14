import React, { useState, useEffect } from 'react';
import { vendorAPI } from '../utils/api';
import { Building, Plus, Edit2, Trash2, Loader, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    name: '',
    maxLimit: '',
    authorizedWallet: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getAllVendors();
      setVendors(response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vendorId || !formData.name || !formData.maxLimit || !formData.authorizedWallet) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingVendor) {
        await vendorAPI.updateVendor(editingVendor.id, formData);
        toast.success('Vendor updated successfully!');
      } else {
        await vendorAPI.registerVendor(formData);
        toast.success('Vendor registered successfully!');
      }
      
      setFormData({ vendorId: '', name: '', maxLimit: '', authorizedWallet: '' });
      setShowForm(false);
      setEditingVendor(null);
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      vendorId: vendor.vendorId,
      name: vendor.name,
      maxLimit: vendor.maxLimit,
      authorizedWallet: vendor.authorizedWallet,
    });
    setShowForm(true);
  };

  const handleDelete = async (vendorId) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorAPI.deleteVendor(vendorId);
      toast.success('Vendor deleted successfully!');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
    setFormData({ vendorId: '', name: '', maxLimit: '', authorizedWallet: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Vendor Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Register Vendor
        </button>
      </div>

      {/* Vendor Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">
            {editingVendor ? 'Edit Vendor' : 'Register New Vendor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor ID
                </label>
                <input
                  type="text"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="VEND_CA_FINAL"
                  disabled={!!editingVendor}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ananyaa Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Limit ($)
                </label>
                <input
                  type="number"
                  name="maxLimit"
                  value={formData.maxLimit}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authorized Wallet
                </label>
                <input
                  type="text"
                  name="authorizedWallet"
                  value={formData.authorizedWallet}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="0xABC123"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    {editingVendor ? 'Updating...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    <Plus size={20} className="mr-2" />
                    {editingVendor ? 'Update Vendor' : 'Register Vendor'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vendors Table */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Registered Vendors</h3>
        {vendors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No vendors registered yet. Register your first vendor to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authorized Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor.vendorId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(vendor.maxLimit || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono text-xs">
                        {vendor.authorizedWallet}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
