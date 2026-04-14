import React, { useState } from 'react';
import { vendorAPI, purchaseOrderAPI, paymentAPI, financeAPI } from '../utils/api';
import { Building, FileText, DollarSign, CreditCard, Plus, Loader, AlertTriangle } from 'lucide-react';
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
  
  const [poForm, setPoForm] = useState({
    poId: '',
    vendor: '', // Fixed: was vendorId
    buyer: '',
    amount: '',
  });
  
  // Financial Actions Forms
  const [financeForm, setFinanceForm] = useState({
    invoiceId: '',
    amount: '',
  });
  
  const [paymentForm, setPaymentForm] = useState({
    paymentId: '',
    invoiceId: '',
    amount: '',
    toWallet: '',
  });

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

  const handlePoSubmit = async (e) => {
    e.preventDefault();
    if (!poForm.poId || !poForm.vendor || !poForm.buyer || !poForm.amount) {
      toast.error('Please fill all purchase order fields');
      return;
    }
    
    try {
      setLoading(true);
      // Ensure amount is sent as string and all fields are defined
      const poData = {
        poId: poForm.poId,
        vendor: poForm.vendor,
        buyer: poForm.buyer,
        amount: String(poForm.amount), // Ensure amount is string
      };
      
      console.log('Sending PO data:', poData); // Debug: Log what we're sending
      await purchaseOrderAPI.createPurchaseOrder(poData);
      toast.success('Purchase order created successfully!');
      setPoForm({ poId: '', vendor: '', buyer: '', amount: '' });
    } catch (error) {
      console.error('Error creating PO:', error);
      // Enhanced error logging
      if (error.response) {
        console.log('Server error response:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    if (!financeForm.invoiceId) {
      toast.error('Please fill Invoice ID');
      return;
    }
    
    try {
      setLoading(true);
      await financeAPI.financeInvoice(financeForm.invoiceId);
      toast.success('Invoice financed successfully!');
      setFinanceForm({ invoiceId: '', amount: '' });
    } catch (error) {
      console.error('Error financing invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.paymentId || !paymentForm.invoiceId || !paymentForm.amount || !paymentForm.toWallet) {
      toast.error('Please fill all payment fields');
      return;
    }
    
    try {
      setLoading(true);
      await paymentAPI.processPayment(paymentForm);
      toast.success('Payment processed successfully!');
      setPaymentForm({ paymentId: '', invoiceId: '', amount: '', toWallet: '' });
    } catch (error) {
      console.error('Error processing payment:', error);
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
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'financial'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <DollarSign size={18} className="mr-2" />
              Financial Actions
            </div>
          </button>
        </nav>
      </div>

      {/* Setup Network Tab */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Create Purchase Order Form */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-green-600" />
              Create Purchase Order
            </h3>
            <form onSubmit={handlePoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO ID</label>
                <input
                  type="text"
                  value={poForm.poId}
                  onChange={(e) => setPoForm({...poForm, poId: e.target.value})}
                  className="input-field"
                  placeholder="PO_001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={poForm.vendor}
                  onChange={(e) => setPoForm({...poForm, vendor: e.target.value})}
                  className="input-field"
                  placeholder="VEND_CA_FINAL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                <input
                  type="text"
                  value={poForm.buyer}
                  onChange={(e) => setPoForm({...poForm, buyer: e.target.value})}
                  className="input-field"
                  placeholder="Buyer Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={poForm.amount}
                  onChange={(e) => setPoForm({...poForm, amount: e.target.value})}
                  className="input-field"
                  placeholder="50000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Create Purchase Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Financial Actions Tab */}
      {activeTab === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Finance Invoice Form */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-purple-600" />
              Finance Invoice
            </h3>
            <form onSubmit={handleFinanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                <input
                  type="text"
                  value={financeForm.invoiceId}
                  onChange={(e) => setFinanceForm({...financeForm, invoiceId: e.target.value})}
                  className="input-field"
                  placeholder="INV_001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={financeForm.amount}
                  onChange={(e) => setFinanceForm({...financeForm, amount: e.target.value})}
                  className="input-field"
                  placeholder="25000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success w-full"
              >
                {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Finance Invoice'}
              </button>
            </form>
          </div>

          {/* Process Payment Form */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <CreditCard size={20} className="mr-2 text-orange-600" />
              Process Payment
            </h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                <input
                  type="text"
                  value={paymentForm.paymentId}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentId: e.target.value})}
                  className="input-field"
                  placeholder="PAY_001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                <input
                  type="text"
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({...paymentForm, invoiceId: e.target.value})}
                  className="input-field"
                  placeholder="INV_001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  className="input-field"
                  placeholder="25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Wallet</label>
                <input
                  type="text"
                  value={paymentForm.toWallet}
                  onChange={(e) => setPaymentForm({...paymentForm, toWallet: e.target.value})}
                  className="input-field"
                  placeholder="0xVENDOR_WALLET"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Process Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
