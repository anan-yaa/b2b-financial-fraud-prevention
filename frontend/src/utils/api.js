import axios from 'axios';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add role to every request
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage since we can't use hooks here
    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Add role to request body if it's a POST/PUT/PATCH request
      if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = {
          ...config.data,
          role: user.role,
        };
      }
      // Add role to headers as well for GET requests
      config.headers['X-User-Role'] = user.role;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      },
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response received',
      request: error.request ? 'Request was made but no response received' : 'No request made'
    });
    
    // Debug: Log the raw error message for verification errors
    if (error.config?.url?.includes('/verify')) {
      console.log('🔍 Verification Error Debug:', {
        rawData: error.response?.data,
        rawError: error.response?.data?.error,
        rawMessage: error.response?.data?.message,
        extractedMessage: error.response?.data?.error || error.response?.data?.message || 'No message found'
      });
    }
    
    // Extract specific blockchain error message
    let errorMessage = 'An error occurred';
    
    if (error.response && error.response.data) {
      // Handle blockchain peer responses that may contain duplicate messages
      let rawMessage = error.response.data.error || 
                      error.response.data.message || 
                      error.response.data.error?.message || 
                      'Server validation failed';
      
      // Extract unique message from blockchain peer responses
      // Format: "No valid responses from any peers. Errors: peer=peer0.org1.example.com, status=500, message=the invoice INV_001 already exists"
      if (rawMessage.includes('No valid responses from any peers')) {
        const messageMatch = rawMessage.match(/message=([^,]+)/);
        if (messageMatch) {
          errorMessage = messageMatch[1].trim();
        } else {
          errorMessage = rawMessage;
        }
      } else {
        // For verification errors and other direct messages, use the full message
        // This ensures messages like "invoice INV_001 cannot be verified, current status: VALIDATED" are displayed completely
        errorMessage = rawMessage;
      }
    } else if (error.request) {
      errorMessage = 'Network Error - Unable to connect to the server. Check if backend is running on port 3000.';
    } else {
      errorMessage = 'Request Error - Please try again';
    }
    
    // Handle common error scenarios with specific messages
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Use the specific blockchain error message with unique ID
          toast.error(errorMessage, { id: 'api-error-400' });
          break;
        case 401:
          toast.error('Unauthorized - Please check your role permissions', { id: 'api-error-401' });
          break;
        case 403:
          toast.error('Forbidden - You do not have permission for this action', { id: 'api-error-403' });
          break;
        case 404:
          toast.error('Resource not found', { id: 'api-error-404' });
          break;
        case 409:
          if (errorMessage.includes('Double Disbursement')) {
            toast.error('Double Disbursement Blocked: This invoice has already been processed', { id: 'api-error-double-disbursement' });
          } else if (errorMessage.includes('Discovery Error')) {
            toast.error('Discovery Error: There was an issue with the blockchain transaction', { id: 'api-error-discovery' });
          } else {
            toast.error(errorMessage, { id: 'api-error-409' });
          }
          break;
        case 500:
          toast.error(errorMessage || 'Server Error - Please try again later', { id: 'api-error-500' });
          break;
        default:
          toast.error(errorMessage, { id: `api-error-${status}` });
      }
    } else {
      toast.error(errorMessage, { id: 'network-error' });
    }
    
    // Create a custom error with the specific message for components to use
    const customError = new Error(errorMessage);
    customError.response = error.response;
    customError.originalError = error;
    
    return Promise.reject(customError);
  }
);

// API functions for different endpoints
export const invoiceAPI = {
  // Upload new invoice
  uploadInvoice: (invoiceData) => api.post('/invoice', invoiceData),
  
  // Get all invoices
  getAllInvoices: () => api.get('/invoices'),
  
  // Get invoice by ID
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  
  // Verify/Approve invoice (Buyer)
  verifyInvoice: (id) => api.post(`/invoices/${id}/verify`),
  
  // Approve financing (Admin)
  approveFinancing: (id) => api.post(`/invoices/${id}/approve-financing`),
  
  // Process payment (Admin)
  processPayment: (id) => api.post(`/invoices/${id}/process-payment`),
  
  // Get audit trail (Auditor)
  getAuditTrail: (id) => api.get(`/invoices/${id}/audit-trail`),
};

export const vendorAPI = {
  // Register new vendor
  registerVendor: (vendorData) => api.post('/vendor', vendorData),
  
  // Get all vendors
  getAllVendors: () => api.get('/vendors'),
  
  // Get vendor by ID
  getVendorById: (vendorId) => api.get(`/vendor/${vendorId}`),
  
  // Update vendor
  updateVendor: (vendorId, vendorData) => api.put(`/vendor/${vendorId}`, vendorData),
  
  // Delete vendor
  deleteVendor: (vendorId) => api.delete(`/vendor/${vendorId}`),
};

export const purchaseOrderAPI = {
  // Create purchase order
  createPurchaseOrder: (poData) => api.post('/purchaseOrder', poData),
  
  // Get all purchase orders
  getAllPurchaseOrders: () => api.get('/purchaseOrders'),
  
  // Get purchase order by ID
  getPurchaseOrderById: (poId) => api.get(`/purchaseOrder/${poId}`),
};

export const paymentAPI = {
  // Process payment
  processPayment: (paymentData) => api.post('/pay', paymentData),
  
  // Get all payments
  getAllPayments: () => api.get('/payments'),
  
  // Get payment by ID
  getPaymentById: (paymentId) => api.get(`/payment/${paymentId}`),
};

export const validationAPI = {
  // Verify invoice
  verifyInvoice: (invoiceId) => api.post('/verify', { invoiceId }),
  
  // Get validation status
  getValidationStatus: (invoiceId) => api.get(`/verify/${invoiceId}/status`),
};

export const financeAPI = {
  // Finance invoice
  financeInvoice: (invoiceId) => api.post('/finance', { invoiceId, role: 'ADMIN' }),
  
  // Get financing status
  getFinancingStatus: (invoiceId) => api.get(`/finance/${invoiceId}/status`),
};

export const auditAPI = {
  // Get invoice history/lifecycle
  getInvoiceHistory: (invoiceId) => api.get(`/audit/${invoiceId}`),
  
  // Get full provenance from blockchain
  getProvenance: (invoiceId) => api.get(`/audit/${invoiceId}/provenance`),
};

export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),
};

export default api;
