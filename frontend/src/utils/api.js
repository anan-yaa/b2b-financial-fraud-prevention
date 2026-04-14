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
    
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Bad Request');
          break;
        case 401:
          toast.error('Unauthorized - Please check your role permissions');
          break;
        case 403:
          toast.error('Forbidden - You do not have permission for this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 409:
          if (data.message && data.message.includes('Double Disbursement')) {
            toast.error('Double Disbursement Blocked: This invoice has already been processed');
          } else if (data.message && data.message.includes('Discovery Error')) {
            toast.error('Discovery Error: There was an issue with the blockchain transaction');
          } else {
            toast.error(data.message || 'Conflict');
          }
          break;
        case 500:
          toast.error('Server Error - Please try again later');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network Error - Unable to connect to the server. Check if backend is running on port 3000.');
    } else {
      toast.error('Request Error - Please try again');
    }
    
    return Promise.reject(error);
  }
);

// API functions for different endpoints
export const invoiceAPI = {
  // Upload new invoice
  uploadInvoice: (invoiceData) => api.post('/invoice', invoiceData),
  
  // Get all invoices
  getAllInvoices: () => api.get('/invoices'),
  
  // Get invoice by ID
  getInvoiceById: (id) => api.get(`/invoice/${id}`),
  
  // Verify/Approve invoice (Buyer)
  verifyInvoice: (id) => api.post('/verify', { invoiceId: id }),
  
  // Approve financing (Admin)
  approveFinancing: (id) => api.post('/finance', { invoiceId: id }),
  
  // Process payment (Admin)
  processPayment: (paymentData) => api.post('/pay', paymentData),
  
  // Get audit trail (Auditor)
  getAuditTrail: (id) => api.get(`/invoice/${id}/history`),
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
  financeInvoice: (invoiceId) => api.post('/finance', { invoiceId }),
  
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
