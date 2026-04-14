import React, { useState } from 'react';
import { validationAPI } from '../utils/api';
import { CheckCircle, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const BuyerPanel = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [validationResult, setValidationResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!invoiceId.trim()) {
      toast.error('Please enter an Invoice ID');
      return;
    }

    try {
      setLoading(true);
      setValidationResult(null); // Clear previous results
      
      // Call verification API
      const response = await validationAPI.verifyInvoice(invoiceId.trim());
      console.log('Verification response:', response.data);
      
      // The verification endpoint now returns the updated invoice details
      if (response.data.invoice) {
        setValidationResult(response.data.invoice);
      } else {
        // Fallback: if no invoice data, try to fetch it separately
        await fetchInvoiceDetails(invoiceId.trim());
      }
      
      // Clear any existing error toasts and show success
      toast.dismiss();
      toast.success('Invoice verification completed!', { id: 'verification-success' });
    } catch (error) {
      console.error('Error verifying invoice:', error);
      // Error toast already handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (id) => {
    try {
      setFetchingDetails(true);
      const response = await validationAPI.getValidationStatus(id);
      console.log('Invoice details response:', response.data);
      setValidationResult(response.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      // Set a validation failed state if we can't fetch details
      setValidationResult({
        invoiceId: id,
        status: 'VALIDATION_FAILED',
        error: 'Failed to fetch invoice details after verification'
      });
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleInputChange = (e) => {
    setInvoiceId(e.target.value);
    setValidationResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
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
      
      {/* Validation Result */}
      {(validationResult || fetchingDetails) && (
        <div className="mt-6 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Result</h3>
          
          {/* Loading Skeleton */}
          {fetchingDetails && (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="text-center text-sm text-gray-500">
                <Loader className="animate-spin inline mr-2" size={16} />
                Fetching invoice details...
              </div>
            </div>
          )}
          
          {/* Validation Result Data */}
          {validationResult && !fetchingDetails && (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Invoice ID:</span>
                <span className="text-sm text-gray-900">{validationResult.invoiceId || validationResult.InvoiceID}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  validationResult.status === 'VALIDATED' || validationResult.Status === 'VALIDATED'
                    ? 'bg-green-100 text-green-800'
                    : validationResult.status === 'PENDING' || validationResult.Status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : validationResult.status === 'VALIDATION_FAILED' || validationResult.Status === 'VALIDATION_FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {validationResult.status || validationResult.Status || 'VALIDATION_FAILED'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Vendor:</span>
                <span className="text-sm text-gray-900">{validationResult.vendor || validationResult.Vendor}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm text-gray-900">${validationResult.amount || validationResult.Amount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">PO ID:</span>
                <span className="text-sm text-gray-900">{validationResult.purchaseOrderId || validationResult.PurchaseOrderID || validationResult.poId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Delivery Proof:</span>
                <span className="text-sm text-gray-900">{validationResult.deliveryProofHash || validationResult.DeliveryProofHash || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Verified At:</span>
                <span className="text-sm text-gray-900">
                  {validationResult.verifiedAt || validationResult.VerifiedAt
                    ? new Date(validationResult.verifiedAt || validationResult.VerifiedAt).toLocaleString()
                    : 'Not verified yet'
                  }
                </span>
              </div>
              
              {/* Error Display */}
              {validationResult.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{validationResult.error}</p>
                </div>
              )}
            </div>
          )}
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
