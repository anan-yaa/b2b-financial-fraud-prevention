import React, { useState } from 'react';
import { auditAPI } from '../utils/api';
import { History, Search, Loader, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditorPanel = () => {
  const [loading, setLoading] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [auditResult, setAuditResult] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    
    if (!invoiceId.trim()) {
      toast.error('Please enter an Invoice ID');
      return;
    }

    try {
      setLoading(true);
      const response = await auditAPI.getInvoiceHistory(invoiceId.trim());
      setAuditResult(response.data);
      // Clear any existing error toasts and show success
      toast.dismiss();
      toast.success('Invoice history retrieved successfully!', { id: 'audit-success' });
    } catch (error) {
      console.error('Error fetching audit history:', error);
      setAuditResult(null);
      // Error toast already handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInvoiceId(e.target.value);
    setAuditResult(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="text-yellow-500" size={16} />;
      case 'VALIDATED':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'APPROVED':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'REJECTED':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <FileText className="text-gray-500" size={16} />;
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <History size={28} className="mr-3 text-purple-600" />
          Invoice History Lookup
        </h2>
        
        <form onSubmit={handleLookup} className="space-y-6">
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
                placeholder="Enter Invoice ID to view full lifecycle"
                required
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center py-3"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Retrieving History...
              </>
            ) : (
              <>
                <History size={20} className="mr-2" />
                View Full Lifecycle
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Audit Result */}
      {auditResult && (
        <div className="mt-6 space-y-6">
          {/* Invoice Overview */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Invoice ID:</span>
                <span className="text-sm text-gray-900 font-mono">{auditResult.invoiceId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Current Status:</span>
                <div className="flex items-center">
                  {getStatusIcon(auditResult.currentStatus)}
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(auditResult.currentStatus)}`}>
                    {auditResult.currentStatus}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Vendor:</span>
                <span className="text-sm text-gray-900">{auditResult.vendor}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Buyer:</span>
                <span className="text-sm text-gray-900">{auditResult.buyer}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm text-gray-900">${auditResult.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">PO ID:</span>
                <span className="text-sm text-gray-900">{auditResult.poId}</span>
              </div>
            </div>
          </div>

          {/* Blockchain Provenance */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText size={20} className="mr-2" />
              Blockchain Provenance
            </h3>
            {auditResult.provenance && auditResult.provenance.length > 0 ? (
              <div className="space-y-4">
                {auditResult.provenance.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          {getStatusIcon(event.status)}
                          <span className="ml-2 font-medium text-gray-900">{event.action}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">By:</span> {event.performedBy}
                        </p>
                        {event.details && (
                          <p className="text-sm text-gray-500">{event.details}</p>
                        )}
                        {event.transactionHash && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            TX: {event.transactionHash}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No provenance data available</p>
            )}
          </div>

          {/* Audit Trail Summary */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Trail Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{auditResult.totalEvents || 0}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{auditResult.uniqueParticipants || 0}</p>
                <p className="text-sm text-blue-600">Participants</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">
                  {auditResult.firstEvent ? new Date(auditResult.firstEvent).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-green-600">First Activity</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-sm font-medium text-purple-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Enter the Invoice ID to view the complete lifecycle and provenance</li>
          <li>• The system will retrieve all blockchain transactions related to this invoice</li>
          <li>• View the full audit trail with timestamps and participant details</li>
          <li>• All data is immutable and stored on the blockchain</li>
        </ul>
      </div>
    </div>
  );
};

export default AuditorPanel;
