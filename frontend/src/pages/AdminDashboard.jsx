import React, { useState, useEffect } from 'react';
import { invoiceAPI } from '../utils/api';
import { DollarSign, CreditCard, FileText, Loader, CheckCircle, Eye, Users, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import VendorManagement from '../components/VendorManagement';

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAllInvoices();
      // Filter for validated invoices that need financing approval
      const validatedInvoices = (response.data || []).filter(
        invoice => invoice.status === 'VALIDATED'
      );
      setInvoices(validatedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFinancing = async (invoiceId) => {
    try {
      setProcessing({ type: 'financing', id: invoiceId });
      await invoiceAPI.approveFinancing(invoiceId);
      toast.success('Financing approved successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error approving financing:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleProcessPayment = async (invoiceId) => {
    try {
      setProcessing({ type: 'payment', id: invoiceId });
      await invoiceAPI.processPayment(invoiceId);
      toast.success('Payment processed successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage invoices, vendors, and platform operations</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <FileText size={18} className="mr-2" />
              Invoice Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vendors'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Building size={18} className="mr-2" />
              Vendor Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'invoices' ? (
        <div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Financed Today</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <CreditCard className="text-orange-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payments Processed</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

      {/* Invoices Table */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Validated Invoices - Ready for Financing</h2>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No invoices pending financing approval.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PO ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.vendorName || 'Vendor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.poId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.validatedAt || invoice.createdAt).toLocaleDateString()}
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleApproveFinancing(invoice.id)}
                              disabled={processing?.id === invoice.id && processing?.type === 'financing'}
                              className="btn btn-success text-xs"
                            >
                              {processing?.id === invoice.id && processing?.type === 'financing' ? (
                                <>
                                  <Loader className="animate-spin mr-1" size={14} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <DollarSign size={14} className="mr-1" />
                                  Approve Financing
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleProcessPayment(invoice.id)}
                              disabled={processing?.id === invoice.id && processing?.type === 'payment'}
                              className="btn btn-primary text-xs"
                            >
                              {processing?.id === invoice.id && processing?.type === 'payment' ? (
                                <>
                                  <Loader className="animate-spin mr-1" size={14} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard size={14} className="mr-1" />
                                  Process Payment
                                </>
                              )}
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

      {/* Invoice Detail Modal */}
          {selectedInvoice && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedInvoice(null)}>
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Invoice ID:</span>
                        <p className="text-sm text-gray-900">{selectedInvoice.invoiceId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Amount:</span>
                        <p className="text-sm text-gray-900">${selectedInvoice.amount?.toFixed(2) || '0.00'}</p>
                      </div>
                  <div>
                        <span className="text-sm font-medium text-gray-500">Purchase Order ID:</span>
                        <p className="text-sm text-gray-900">{selectedInvoice.poId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Delivery Proof Hash:</span>
                        <p className="text-sm text-gray-900 break-all">{selectedInvoice.deliveryProofHash}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <p className="text-sm text-gray-900">{selectedInvoice.status}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Vendor:</span>
                        <p className="text-sm text-gray-900">{selectedInvoice.vendorName || 'Vendor'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(null)}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <VendorManagement />
      )}
    </div>
  );
};

export default AdminDashboard;
