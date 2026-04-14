import React, { useState } from 'react';
import { validationAPI, purchaseOrderAPI, paymentAPI } from '../utils/api';
import { CheckCircle, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const BuyerPanel = () => {
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [poForm, setPoForm] = useState({ poId: '', vendor: '', buyer: '', amount: '' });
  const [initiatePaymentForm, setInitiatePaymentForm] = useState({ paymentId: '', invoiceId: '', amount: '', toWallet: '' });

  const handlePoSubmit = async (e) => {
    e.preventDefault();
    const { poId, vendor, buyer, amount } = poForm;
    if (!poId || !vendor || !buyer || !amount) {
      toast.error('Please fill all purchase order fields');
      return;
    }

    try {
      setLoading(true);
      const poData = { poId, vendor, buyer, amount: String(amount) };
      await purchaseOrderAPI.createPurchaseOrder(poData);
      toast.success('Purchase order created successfully!');
      setPoForm({ poId: '', vendor: '', buyer: '', amount: '' });
    } catch (error) {
      console.error('Error creating PO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePaymentSubmit = async (e) => {
    e.preventDefault();
    const { paymentId, invoiceId, amount, toWallet } = initiatePaymentForm;
    if (!paymentId || !invoiceId || !amount || !toWallet) {
      toast.error('Please fill all payment fields');
      return;
    }

    try {
      setLoading(true);
      await paymentAPI.processPayment({ paymentId, invoiceId, amount, toWallet });
      toast.success('Payment initiated successfully!');
      setInitiatePaymentForm({ paymentId: '', invoiceId: '', amount: '', toWallet: '' });
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!invoiceId.trim()) {
      toast.error('Please enter an Invoice ID');
      return;
    }

    try {
      setLoading(true);
      const response = await validationAPI.verifyInvoice(invoiceId.trim());
      setValidationResult(response.data);
      toast.success('Invoice verification completed!');
    } catch (error) {
      console.error('Error verifying invoice:', error);
      setValidationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInvoiceId(e.target.value);
    setValidationResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Purchase Order (Buyer) */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Purchase Order</h2>
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
              placeholder="BUYER_001"
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
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Create Purchase Order'}
          </button>
        </form>
      </div>
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <CheckCircle size={28} className="mr-3 text-green-600" />
          Invoice Validation
        </h2>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={invoiceId}
                onChange={handleInputChange}
                className="input-field pl-10"
                placeholder="Enter Invoice ID to verify"
                required
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success w-full flex items-center justify-center py-3"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Verifying Invoice...
              </>
            ) : (
              <>
                <CheckCircle size={20} className="mr-2" />
                Verify Invoice
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Initiate Payment (moved from Admin) */}
      <div className="card mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Initiate Payment</h2>
        <form onSubmit={handleInitiatePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
            <input
              type="text"
              value={initiatePaymentForm.paymentId}
              onChange={(e) => setInitiatePaymentForm({...initiatePaymentForm, paymentId: e.target.value})}
              className="input-field"
              placeholder="PAY_001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
            <input
              type="text"
              value={initiatePaymentForm.invoiceId}
              onChange={(e) => setInitiatePaymentForm({...initiatePaymentForm, invoiceId: e.target.value})}
              className="input-field"
              placeholder="INV_001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={initiatePaymentForm.amount}
              onChange={(e) => setInitiatePaymentForm({...initiatePaymentForm, amount: e.target.value})}
              className="input-field"
              placeholder="25000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Wallet</label>
            <input
              type="text"
              value={initiatePaymentForm.toWallet}
              onChange={(e) => setInitiatePaymentForm({...initiatePaymentForm, toWallet: e.target.value})}
              className="input-field"
              placeholder="0xVENDOR_WALLET"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">Initiate Payment</button>
        </form>
      </div>
      
      {/* Validation Result */}
      {validationResult && (
        <div className="mt-6 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Result</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Invoice ID:</span>
              <span className="text-sm text-gray-900">{validationResult.invoiceId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                validationResult.status === 'VALIDATED' 
                  ? 'bg-green-100 text-green-800'
                  : validationResult.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {validationResult.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Vendor:</span>
              <span className="text-sm text-gray-900">{validationResult.vendor}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-600">Amount:</span>
              <span className="text-sm text-gray-900">${validationResult.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium text-gray-600">PO ID:</span>
              <span className="text-sm text-gray-900">{validationResult.poId}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Verified At:</span>
              <span className="text-sm text-gray-900">
                {validationResult.verifiedAt 
                  ? new Date(validationResult.verifiedAt).toLocaleString()
                  : 'Not verified yet'
                }
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Enter the Invoice ID you want to verify</li>
          <li>• Click "Verify Invoice" to validate the invoice details</li>
          <li>• The system will check the invoice against the blockchain records</li>
          <li>• Verification results will show the current status and details</li>
        </ul>
      </div>
    </div>
  );
};

export default BuyerPanel;
