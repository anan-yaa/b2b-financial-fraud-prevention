import React, { useState } from 'react';
import { invoiceAPI } from '../utils/api';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!invoiceForm.invoiceId || !invoiceForm.vendor || !invoiceForm.buyer || 
        !invoiceForm.amount || !invoiceForm.poId || !invoiceForm.deliveryProofHash) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      // Ensure data keys match backend expectations and amount is string
      const invoiceData = {
        invoiceId: invoiceForm.invoiceId,
        vendor: invoiceForm.vendor,
        buyer: invoiceForm.buyer,
        amount: String(invoiceForm.amount), // Ensure amount is string
        purchaseOrderId: invoiceForm.poId, // Fixed: was poId, backend expects purchaseOrderId
        deliveryProofHash: invoiceForm.deliveryProofHash,
      };
      
      console.log('Sending invoice data:', invoiceData); // Debug: Log what we're sending
      await invoiceAPI.uploadInvoice(invoiceData);
      
      // Clear any existing error toasts and show success
      toast.dismiss();
      toast.success('Invoice submitted successfully!', { id: 'invoice-success' });
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
      // Display specific blockchain error message as toast (already handled by interceptor)
      // No need to show duplicate error toast here since interceptor handles it
      
      // Enhanced error logging for debugging
      if (error.response) {
        console.log('Server error response:', error.response.data);
      }
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
                Vendor Name
              </label>
              <input
                type="text"
                name="vendor"
                value={invoiceForm.vendor}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ananyaa Corp"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buyer Name
              </label>
              <input
                type="text"
                name="buyer"
                value={invoiceForm.buyer}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Buyer Corp"
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
