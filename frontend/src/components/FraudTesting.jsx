import React, { useState } from 'react';
import { paymentAPI, invoiceAPI } from '../utils/api';
import { AlertTriangle, Loader, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const FraudTesting = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  
  // Fraud test data
  const fundDiversionTest = {
    paymentId: 'FRAUD_PAY_001',
    invoiceId: 'INV_001',
    amount: '25000',
    toWallet: '0xHACKER_999',
  };
  
  const misreportingTest = {
    invoiceId: 'INV_001',
    amount: '999999', // Artificially high amount
    vendor: 'Fake Vendor Corp',
    buyer: 'Fake Buyer Corp',
    poId: 'FAKE_PO_001',
    deliveryProofHash: '0xFAKE_HASH_123456789',
  };

  const handleFundDiversion = async () => {
    try {
      setLoading(true);
      const result = {
        test: 'Fund Diversion',
        timestamp: new Date().toISOString(),
        data: fundDiversionTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      await paymentAPI.processPayment(fundDiversionTest);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === result.timestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - Security breach detected!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Fund diversion succeeded!');
    } catch (error) {
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === result.timestamp 
          ? { ...r, status: 'blocked', error: error.message }
          : r
      ));
      
      toast.error(`Fund Diversion Blocked: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMisreporting = async () => {
    try {
      setLoading(true);
      const result = {
        test: 'Misreporting',
        timestamp: new Date().toISOString(),
        data: misreportingTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      await invoiceAPI.uploadInvoice(misreportingTest);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === result.timestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - Data validation failed!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Misreporting succeeded!');
    } catch (error) {
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === result.timestamp 
          ? { ...r, status: 'blocked', error: error.message }
          : r
      ));
      
      toast.error(`Misreporting Blocked: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Loader className="animate-spin text-yellow-500" size={16} />;
      case 'blocked':
        return <Shield className="text-green-500" size={16} />;
      case 'success':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-green-100 text-green-800';
      case 'success':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-600 mr-3" size={24} />
          <div>
            <h3 className="text-lg font-medium text-red-900">Fraud Testing Zone</h3>
            <p className="text-sm text-red-700">
              This section simulates fraudulent activities to test blockchain security measures. 
              These tests should trigger security alerts and be blocked by the system.
            </p>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fund Diversion Test */}
        <div className="card border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Attempt Fund Diversion
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm font-medium text-red-900 mb-2">Test Scenario:</p>
              <p className="text-sm text-red-700">
                Attempts to divert payment to unauthorized wallet (0xHACKER_999)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Payment ID:</span>
                <span className="font-mono text-red-600">{fundDiversionTest.paymentId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Invoice ID:</span>
                <span className="font-mono">{fundDiversionTest.invoiceId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Amount:</span>
                <span>${fundDiversionTest.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">To Wallet:</span>
                <span className="font-mono text-red-600">{fundDiversionTest.toWallet}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleFundDiversion}
            disabled={loading}
            className="btn btn-danger w-full"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Testing...
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="mr-2" />
                Execute Fund Diversion Test
              </>
            )}
          </button>
        </div>

        {/* Misreporting Test */}
        <div className="card border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Attempt Misreporting
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm font-medium text-red-900 mb-2">Test Scenario:</p>
              <p className="text-sm text-red-700">
                Attempts to submit invoice with fake data and inflated amount
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Invoice ID:</span>
                <span className="font-mono text-red-600">{misreportingTest.invoiceId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Amount:</span>
                <span className="font-mono text-red-600">${misreportingTest.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Vendor:</span>
                <span className="text-red-600">{misreportingTest.vendor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">PO ID:</span>
                <span className="text-red-600">{misreportingTest.poId}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleMisreporting}
            disabled={loading}
            className="btn btn-danger w-full"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Testing...
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="mr-2" />
                Execute Misreporting Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield size={20} className="mr-2" />
            Test Results
          </h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <span className="ml-2 font-medium">{result.test}</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {result.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-900">Security Alert:</p>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
                
                {result.message && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-medium text-yellow-900">Warning:</p>
                    <p className="text-sm text-yellow-700">{result.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="text-blue-600 mr-3 mt-1" size={20} />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Security Features Tested:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Wallet validation - Only authorized wallets can receive payments</li>
              <li>• Amount verification - Prevents inflated or fraudulent amounts</li>
              <li>• Data integrity checks - Validates all invoice data against blockchain records</li>
              <li>• Access control - Role-based permissions prevent unauthorized actions</li>
              <li>• Audit trail - All attempts are logged and traceable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudTesting;
