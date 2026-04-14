import React, { useState } from 'react';
import axios from 'axios';
import { paymentAPI, invoiceAPI } from '../utils/api';
import { AlertTriangle, Loader, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const FraudTesting = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [lastError, setLastError] = useState(null);
  const [targetInvoice, setTargetInvoice] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Fraud test data
  const fundDiversionTest = {
    paymentId: 'FRAUD_PAY_001',
    invoiceId: 'INV_001',
    amount: '25000',
    toWallet: '0xHACKER_999',
  };
  
  const misreportingTest = {
    invoiceId: 'INV0_001',
    amount: '999999', // Artificially high amount
    vendor: 'VENDOR1',
    buyer: 'BUYER_02',
    purchaseOrderId: 'PO_002',
    deliveryProofHash: '0xFAKE_HASH_123456789',
  };

  const phantomPoTest = {
    invoiceId: 'FRAUD_INV_999',
    vendor: 'VENDOR1',
    buyer: 'BUYER_02',
    amount: '5000',
    purchaseOrderId: 'NON_EXISTENT_PO_001',
    deliveryProofHash: 'FAKE_HASH_123',
    role: 'VENDOR'
  };

  const doubleDisbursementTest = {
    paymentId: 'DUPLICATE_PAY_002',
    invoiceId: 'INV_001',
    amount: '50000',
    toWallet: '0xVENDOR_WALLET_001',
  };

  const handleFundDiversion = async () => {
    const resultTimestamp = new Date().toISOString();
    
    try {
      setLoading(true);
      setLastError(null); // Clear any previous errors
      
      const result = {
        test: 'Fund Diversion',
        timestamp: resultTimestamp,
        data: fundDiversionTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      await paymentAPI.processPayment(fundDiversionTest);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - Security breach detected!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Fund diversion succeeded!');
    } catch (error) {
      console.error('Fund diversion test error:', error);
      
      // Robust error parsing - extract only string message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown blockchain error';
      
      // Set local state for UI display
      setLastError({
        test: 'Fund Diversion',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'blocked', error: errorMessage }
          : r
      ));
      
      // Show security alert toast with shield icon
      toast.dismiss(); // Clear any existing toasts
      toast.error(`BLOCKED BY BLOCKCHAIN: ${errorMessage}`, { 
        id: 'fraud-blocked',
        duration: 5000,
        icon: <Shield size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMisreporting = async () => {
    const resultTimestamp = new Date().toISOString();
    
    try {
      setLoading(true);
      setLastError(null); // Clear any previous errors
      
      const result = {
        test: 'Misreporting',
        timestamp: resultTimestamp,
        data: misreportingTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      await invoiceAPI.uploadInvoice(misreportingTest);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - Data validation failed!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Misreporting succeeded!');
    } catch (error) {
      console.error('Misreporting test error:', error);
      
      // Robust error parsing - extract only string message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown blockchain error';
      
      // Set local state for UI display
      setLastError({
        test: 'Misreporting',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'blocked', error: errorMessage }
          : r
      ));
      
      // Show security alert toast with shield icon
      toast.dismiss(); // Clear any existing toasts
      toast.error(`BLOCKED BY BLOCKCHAIN: ${errorMessage}`, { 
        id: 'fraud-blocked',
        duration: 5000,
        icon: <Shield size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhantomPo = async () => {
    const resultTimestamp = new Date().toISOString();
    
    try {
      setLoading(true);
      setLastError(null); // Clear any previous errors
      
      // Debug: Log the complete invoice data being sent
      console.log('🚀 Phantom PO Test - Sending complete invoice data:', phantomPoTest);
      console.log('🔍 All required fields present:', {
        invoiceId: phantomPoTest.invoiceId,
        vendor: phantomPoTest.vendor,
        buyer: phantomPoTest.buyer,
        amount: phantomPoTest.amount,
        purchaseOrderId: phantomPoTest.purchaseOrderId,
        deliveryProofHash: phantomPoTest.deliveryProofHash,
        role: phantomPoTest.role
      });
      
      const result = {
        test: 'Phantom PO',
        timestamp: resultTimestamp,
        data: phantomPoTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      await invoiceAPI.uploadInvoice(phantomPoTest);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - PO validation failed!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Phantom PO succeeded!');
    } catch (error) {
      console.error('Phantom PO test error:', error);
      
      // Enhanced error logging - log the full response data
      console.log('🔍 Full error response data:', error.response?.data);
      console.log('🔍 Error response status:', error.response?.status);
      
      // Robust error parsing - extract only string message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown blockchain error';
      
      // Set alert message for UI display
      setAlertMessage(errorMessage);
      
      // Set local state for UI display
      setLastError({
        test: 'Phantom PO',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'blocked', error: errorMessage }
          : r
      ));
      
      // Show security alert toast with shield icon
      toast.dismiss(); // Clear any existing toasts
      toast.error(`BLOCKED BY BLOCKCHAIN: ${errorMessage}`, { 
        id: 'fraud-blocked',
        duration: 5000,
        icon: <Shield size={16} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleDisbursement = async () => {
    const resultTimestamp = new Date().toISOString();
    
    try {
      setLoading(true);
      setLastError(null); // Clear any previous errors
      
      // First, fetch the invoice data to get correct amount and vendor info
      let invoice;
      try {
        const res = await axios.get(`http://localhost:3000/invoice/INV_001?role=ADMIN`);
        invoice = res.data;
        console.log('✅ Successfully fetched invoice:', invoice);
      } catch (fetchError) {
        // Handle case where invoice doesn't exist
        if (fetchError.response?.status === 404) {
          toast.error('Error: Invoice INV_001 not found. Please create and pay an invoice normally before running this test.', {
            id: 'invoice-not-found',
            duration: 6000
          });
          return;
        } else {
          throw fetchError; // Re-throw other errors
        }
      }
      
      // Check if invoice is already paid
      if (invoice.status !== 'PAID') {
        toast.error('Please complete a legitimate payment first to test double disbursement.', {
          id: 'no-paid-invoice',
          duration: 5000
        });
        return;
      }
      
      // Fetch vendor information to get authorized wallet
      let vendor;
      try {
        const vendorRes = await axios.get(`http://localhost:3000/vendor/${invoice.vendor}?role=ADMIN`);
        vendor = vendorRes.data;
        console.log('✅ Successfully fetched vendor:', vendor);
      } catch (vendorError) {
        console.error('Failed to fetch vendor info:', vendorError);
        toast.error('Error: Could not fetch vendor information for wallet validation.', {
          id: 'vendor-fetch-error',
          duration: 5000
        });
        return;
      }
      
      // Create dynamic test data with correct wallet and amount
      const dynamicTest = {
        paymentId: 'DUPLICATE_PAY_002',
        invoiceId: 'INV_001',
        amount: invoice.amount, // Use exact amount from invoice
        toWallet: vendor.authorizedWallet, // Use authorized wallet from vendor
        role: 'ADMIN' // Explicitly set role for fraud testing
      };
      
      // Guard: Verify toWallet is not undefined
      console.log('🔍 Payment payload validation:');
      console.log('- toWallet:', dynamicTest.toWallet);
      console.log('- toWallet type:', typeof dynamicTest.toWallet);
      console.log('- Is toWallet a valid string?', typeof dynamicTest.toWallet === 'string' && dynamicTest.toWallet.trim().length > 0);
      
      if (!dynamicTest.toWallet || typeof dynamicTest.toWallet !== 'string' || dynamicTest.toWallet.trim().length === 0) {
        toast.error('Error: Authorized wallet is missing or invalid. Cannot proceed with payment test.', {
          id: 'invalid-wallet',
          duration: 5000
        });
        return;
      }
      
      const result = {
        test: 'Double Disbursement',
        timestamp: resultTimestamp,
        data: dynamicTest,
        status: 'pending',
        error: null
      };
      
      setTestResults(prev => [result, ...prev]);
      
      // Debug: Log the exact API call being made
      console.log('🚀 Making payment API call with data:', dynamicTest);
      console.log('🔍 Invoice ID being used:', dynamicTest.invoiceId);
      console.log('🔍 Payment ID being used:', dynamicTest.paymentId);
      console.log('🔍 Role being used:', dynamicTest.role);
      
      // Make direct axios call with explicit role
      const payRes = await axios.post('http://localhost:3000/pay', dynamicTest);
      console.log('✅ Payment API response:', payRes.data);
      
      // Update result on success
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'success', message: 'Unexpected success - Double payment detected!' }
          : r
      ));
      
      toast.error('SECURITY BREACH: Double disbursement succeeded!');
    } catch (error) {
      console.error('Double disbursement test error:', error);
      
      // Enhanced error logging - log the full response data
      console.log('🔍 Full error response data:', error.response?.data);
      console.log('🔍 Error response status:', error.response?.status);
      console.log('🔍 Error response headers:', error.response?.headers);
      
      // Robust error parsing - extract only string message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown blockchain error';
      
      // Set alert message for UI display
      setAlertMessage(errorMessage);
      
      // Set local state for UI display
      setLastError({
        test: 'Double Disbursement',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Update result on error
      setTestResults(prev => prev.map(r => 
        r.timestamp === resultTimestamp 
          ? { ...r, status: 'blocked', error: errorMessage }
          : r
      ));
      
      // Show security alert toast with shield icon
      toast.dismiss(); // Clear any existing toasts
      toast.error(`BLOCKED BY BLOCKCHAIN: ${errorMessage}`, { 
        id: 'fraud-blocked',
        duration: 5000,
        icon: <Shield size={16} />
      });
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

      {/* Debug Alert Box */}
      {alertMessage && (
        <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-orange-600 mr-3 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-lg font-medium text-orange-900 mb-2">Blockchain Error Details</h4>
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm font-mono text-orange-800">
                  {alertMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="ml-3 text-orange-600 hover:text-orange-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Security Alert Box */}
      {lastError && (
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="text-red-600 mr-3 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="text-lg font-medium text-red-900 mb-2">Security Alert</h4>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Test: {lastError.test}
                </p>
                <p className="text-sm text-red-800 mb-2">
                  {lastError.message}
                </p>
                <p className="text-xs text-red-600">
                  Time: {new Date(lastError.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastError(null)}
              className="ml-3 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            Attempt Fake Invoice (Phantom invoice)
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
                Execute Fake Invoice Test 1
              </>
            )}
          </button>
        </div>

        {/* Phantom PO Test */}
        <div className="card border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Attempt Fake Invoice (Phantom PO)
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm font-medium text-red-900 mb-2">Test Scenario:</p>
              <p className="text-sm text-red-700">
                Attempts to submit invoice against non-existent Purchase Order
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Invoice ID:</span>
                <span className="font-mono text-red-600">{phantomPoTest.invoiceId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Amount:</span>
                <span>${phantomPoTest.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">PO ID:</span>
                <span className="font-mono text-red-600">{phantomPoTest.poId}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePhantomPo}
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
                Execute Fake Invoice Test 2
              </>
            )}
          </button>
        </div>

        {/* Double Disbursement Test */}
        <div className="card border-2 border-red-200">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Attempt Double Disbursement
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="bg-red-50 p-3 rounded">
              <p className="text-sm font-medium text-red-900 mb-2">Test Scenario:</p>
              <p className="text-sm text-red-700">
                Attempts to pay an invoice that has already been marked as PAID
              </p>
              <p className="text-xs text-red-600 mt-1">
                Uses dynamic data from real invoice to bypass wallet validation
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Payment ID:</span>
                <span className="font-mono text-red-600">DUPLICATE_PAY_002</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Invoice ID:</span>
                <span className="font-mono">INV_001</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Amount:</span>
                <span className="text-blue-600">Dynamic (from invoice)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">To Wallet:</span>
                <span className="text-blue-600">Dynamic (authorized wallet)</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDoubleDisbursement}
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
                Execute Double Spend Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && testResults.length > 0 && (
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
              <li>• Double Spend Prevention - Blocks multiple payments for the same invoice</li>
              <li>• Referential Integrity - Validates all invoices against existing Purchase Orders</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudTesting;
