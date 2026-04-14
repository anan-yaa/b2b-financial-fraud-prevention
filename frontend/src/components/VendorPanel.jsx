import React, { useState } from 'react';
import { invoiceAPI, financeAPI } from '../utils/api';
import { FileText, Plus, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorPanel = () => {
  const [loading, setLoading] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceId: '',
    vendor: '',
    buyer: '',
    amount: '',
    poId: '',
    deliveryProofHash: '',
  });

  const [requestPaymentForm, setRequestPaymentForm] = useState({
    invoiceId: '',
    amount: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invoiceForm.invoiceId || !invoiceForm.vendor || !invoiceForm.buyer || 
        !invoiceForm.amount || !invoiceForm.poId || !invoiceForm.deliveryProofHash) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await invoiceAPI.uploadInvoice({
        invoiceId: invoiceForm.invoiceId,
        vendor: invoiceForm.vendor,
        buyer: invoiceForm.buyer,
          amount: String(invoiceForm.amount),
        poId: invoiceForm.poId,
          purchaseOrderId: String(invoiceForm.poId),
          deliveryProofHash: invoiceForm.deliveryProofHash,
      });
      
      toast.success('Invoice submitted successfully!');
      setInvoiceForm({
        invoiceId: '',
        vendor: '',
        buyer: '',
        amount: '',
        poId: '',
        deliveryProofHash: '',
      });
    } catch (error) {
      console.error('Error submitting invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!requestPaymentForm.invoiceId) {
      toast.error('Please fill Invoice ID');
      return;
    }

    try {
      setLoading(true);
      await financeAPI.financeInvoice(requestPaymentForm.invoiceId);
      toast.success('Request for invoice payment submitted!');
      setRequestPaymentForm({ invoiceId: '', amount: '' });
    } catch (error) {
      console.error('Error requesting payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText size={28} className="mr-3 text-blue-600" />
          Submit Invoice
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice ID
              </label>
              <input
                type="text"
                name="invoiceId"
                value={invoiceForm.invoiceId}
                onChange={handleInputChange}
                className="input-field"
                placeholder="INV_001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor ID
                </label>
              <input
                type="text"
                name="vendor"
                value={invoiceForm.vendor}
                onChange={handleInputChange}
                className="input-field"
                placeholder="VENDOR_002"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer ID
                </label>
              <input
                type="text"
                name="buyer"
                value={invoiceForm.buyer}
                onChange={handleInputChange}
                className="input-field"
                placeholder="BUYER_001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                name="amount"
                value={invoiceForm.amount}
                onChange={handleInputChange}
                className="input-field"
                placeholder="25000"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order ID
              </label>
              <input
                type="text"
                name="poId"
                value={invoiceForm.poId}
                onChange={handleInputChange}
                className="input-field"
                placeholder="PO_001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Proof Hash
              </label>
              <input
                type="text"
                name="deliveryProofHash"
                value={invoiceForm.deliveryProofHash}
                onChange={handleInputChange}
                className="input-field"
                placeholder="0x1234...abcd"
                required
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center py-3"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Submitting Invoice...
                </>
              ) : (
                <>
                  <Plus size={20} className="mr-2" />
                  Submit Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Request Invoice Payment (moved from Admin) */}
      <div className="card mt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-purple-600" />
          Request Invoice Payment
        </h3>
        <form onSubmit={handleRequestPaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
            <input
              type="text"
              value={requestPaymentForm.invoiceId}
              onChange={(e) => setRequestPaymentForm({...requestPaymentForm, invoiceId: e.target.value})}
              className="input-field"
              placeholder="INV_001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={requestPaymentForm.amount}
              onChange={(e) => setRequestPaymentForm({...requestPaymentForm, amount: e.target.value})}
              className="input-field"
              placeholder="25000"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-success w-full">
            {loading ? <Loader className="animate-spin mx-auto" size={20} /> : 'Request Payment'}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Fill in all required fields to submit a new invoice</li>
          <li>• The Delivery Proof Hash should be a valid blockchain hash</li>
          <li>• Make sure the Purchase Order ID matches an existing PO</li>
          <li>• Once submitted, the invoice will be available for buyer verification</li>
        </ul>
      </div>
    </div>
  );
};

export default VendorPanel;
