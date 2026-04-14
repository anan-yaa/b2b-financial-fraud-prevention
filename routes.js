const express = require("express");
const { connectFabric } = require("./fabric");

const router = express.Router();

// Role definitions
const ROLES = {
  VENDOR: "VENDOR",
  BUYER: "BUYER",
  ADMIN: "ADMIN",
  AUDITOR: "AUDITOR",
  INVESTOR: "INVESTOR",
};
// Middleware to validate a single role
function validateRole(requiredRole) {
  return (req, res, next) => {
    const { role } = req.body || req.query;

    console.log(`🔍 Role validation - Required: ${requiredRole}, Provided: ${role}`);
    console.log(`🔍 Request body:`, req.body);
    console.log(`🔍 Request query:`, req.query);

    if (!role) {
      console.log(`❌ Role validation failed: No role provided`);
      return res.status(400).json({ error: "Role is required" });
    }

    if (role !== requiredRole) {
      console.log(`❌ Role validation failed: ${role} !== ${requiredRole}`);
      return res
        .status(403)
        .json({
          error: `Access denied. Only ${requiredRole} can perform this action`,
        });
    }

    console.log(`✅ Role validation passed: ${role}`);
    next();
  };
}

// Middleware to validate any of multiple roles
function validateAnyRole(allowedRoles) {
  return (req, res, next) => {
    const { role } = req.body || req.query;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({
          error: `Access denied. Only ${allowedRoles.join(", ")} can perform this action`,
        });
    }

    next();
  };
}

// POST /vendor - Register a new vendor
router.post("/vendor", async (req, res) => {
  let gateway;
  try {
    const { vendorId, name, maxLimit, authorizedWallet, role } = req.body;

    if (!vendorId || !name || !maxLimit || !authorizedWallet) {
      return res.status(400).json({
        error:
          "Missing required fields: vendorId, name, maxLimit, authorizedWallet",
      });
    }

    console.log(
      `Registering vendor ${vendorId} using role: ${role || "ADMIN"}`,
    );
    const { gateway: g, contract } = await connectFabric(role || "ADMIN");
    gateway = g;

    const transaction = contract.createTransaction("RegisterVendor");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(vendorId, name, maxLimit, authorizedWallet);
    console.log(`Vendor ${vendorId} registered successfully`);
    res.json({ success: true, message: "Vendor registered successfully" });
  } catch (error) {
    console.error("POST /vendor error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// GET /vendor/:id - Get a specific vendor by ID
router.get("/vendor/:id", async (req, res) => {
  let gateway;
  try {
    const { id } = req.params;
    const { role } = req.query;

    if (!role) {
      return res
        .status(400)
        .json({ error: "Role is required in query parameters" });
    }

    console.log(`Getting vendor ${id} using role: ${role}`);
    const { gateway: g, contract } = await connectFabric(role);
    gateway = g;

    const result = await contract.evaluateTransaction("ReadVendor", id);
    const vendor = JSON.parse(result.toString());
    res.json(vendor);
  } catch (error) {
    console.error("GET /vendor/:id error:", error);

    // Log detailed peer response if available
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        console.error(
          "Peer response message:",
          error.responses[0].response.message,
        );
      }
    }

    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /buyer - Register a new buyer
router.post("/buyer", async (req, res) => {
  let gateway;
  try {
    const { buyerId, name, authorizedWallet, role } = req.body;

    if (!buyerId || !name || !authorizedWallet) {
      return res.status(400).json({
        error: "Missing required fields: buyerId, name, authorizedWallet",
      });
    }

    console.log(`Registering buyer ${buyerId} using role: ${role || "ADMIN"}`);
    const { gateway: g, contract } = await connectFabric(role || "ADMIN");
    gateway = g;

    const transaction = contract.createTransaction("RegisterBuyer");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(buyerId, name, authorizedWallet);
    console.log(`Buyer ${buyerId} registered successfully`);
    res.json({ success: true, message: "Buyer registered successfully" });
  } catch (error) {
    console.error("POST /buyer error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /purchaseOrder - Create a new purchase order
router.post("/purchaseOrder", async (req, res) => {
  let gateway;
  try {
        console.log('Incoming PO Data:', req.body); // Debug: Log incoming request body
    const { poId, vendor, buyer, amount, role } = req.body;

    if (!poId || !vendor || !buyer || !amount) {
            console.log('Missing fields validation failed:', { poId, vendor, buyer, amount });
      return res.status(400).json({
        error: "Missing required fields: poId, vendor, buyer, amount",
      });
    }

    console.log(
      `Creating purchase order ${poId} using role: ${role || "BUYER"}`,
    );
    const { gateway: g, contract } = await connectFabric(role || "BUYER");
    gateway = g;

    const transaction = contract.createTransaction("CreatePurchaseOrder");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(poId, vendor, buyer, amount);
    console.log(`Purchase order ${poId} created successfully`);
    res.json({ success: true, message: "Purchase order created successfully" });
  } catch (error) {
    console.error("POST /purchaseOrder error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /invoice - Create a new invoice
router.post("/invoice", validateRole(ROLES.VENDOR), async (req, res) => {
  let gateway;
  try {
    const {
      invoiceId,
      vendor,
      buyer,
      amount,
      purchaseOrderId,
      deliveryProofHash,
      role,
    } = req.body;

    if (
      !invoiceId ||
      !vendor ||
      !buyer ||
      !amount ||
      !purchaseOrderId ||
      !deliveryProofHash
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: invoiceId, vendor, buyer, amount, purchaseOrderId, deliveryProofHash",
      });
    }

    console.log(`Creating invoice ${invoiceId} using role: ${role}`);
    const { gateway: g, contract } = await connectFabric(role);
    gateway = g;

    const transaction = contract.createTransaction("CreateInvoice");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(
      invoiceId,
      vendor,
      buyer,
      amount,
      purchaseOrderId,
      deliveryProofHash,
    );
    console.log(`Invoice ${invoiceId} created successfully`);
    res.json({ success: true, message: "Invoice created successfully" });
  } catch (error) {
    console.error("POST /invoice error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /verify - Verify an invoice (BUYER only)
router.post("/verify", validateRole(ROLES.BUYER), async (req, res) => {
  let gateway;
  try {
    const { invoiceId, role } = req.body;

    if (!invoiceId) {
      return res
        .status(400)
        .json({ error: "Missing required field: invoiceId" });
    }

    console.log(`Verifying invoice ${invoiceId} using role: ${role}`);
    const { gateway: g, contract } = await connectFabric(role);
    gateway = g;

    const transaction = contract.createTransaction("VerifyInvoice");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(invoiceId);
    console.log(`Invoice ${invoiceId} verified successfully`);
    res.json({ success: true, message: "Invoice verified successfully" });
  } catch (error) {
    console.error("POST /verify error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /finance - Approve financing for an invoice (ADMIN only)
router.post("/finance", validateRole(ROLES.ADMIN), async (req, res) => {
  let gateway;
  try {
    const { invoiceId, role } = req.body;

    if (!invoiceId) {
      return res
        .status(400)
        .json({ error: "Missing required field: invoiceId" });
    }

    console.log(
      `Approving financing for invoice ${invoiceId} using role: ${role}`,
    );
    const { gateway: g, contract } = await connectFabric(role);
    gateway = g;

    // Sequence Check: Log current invoice status before ApproveFinancing
    console.log(`🔍 Checking current status of invoice ${invoiceId} before financing...`);
    try {
      const currentInvoiceResult = await contract.evaluateTransaction("ReadInvoice", invoiceId);
      const currentInvoice = JSON.parse(currentInvoiceResult.toString());
      console.log(`📋 Current invoice status:`, {
        invoiceId: currentInvoice.invoiceId,
        status: currentInvoice.status,
        amount: currentInvoice.amount,
        vendor: currentInvoice.vendor,
        buyer: currentInvoice.buyer
      });
    } catch (statusCheckError) {
      console.error(`⚠️ Could not fetch current invoice status:`, statusCheckError.message);
    }

    const transaction = contract.createTransaction("ApproveFinancing");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(invoiceId);
    console.log(`Financing approved for invoice ${invoiceId}`);
    res.json({ success: true, message: "Financing approved successfully" });
  } catch (error) {
    console.error("POST /finance error:", error);

    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }

    // Fallback for other errors
    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});
// Add this to your routes.js
router.post("/pay", validateAnyRole(["ADMIN"]), async (req, res) => {
  let gateway;
  try {
    const { paymentId, invoiceId, amount, toWallet, role } = req.body;

    // Backend validation for required parameters
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }
    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId is required" });
    }
    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }
    if (!toWallet) {
      return res.status(400).json({ error: "toWallet is required" });
    }
    if (typeof toWallet !== 'string' || toWallet.trim().length === 0) {
      return res.status(400).json({ error: "toWallet must be a valid non-empty string" });
    }

    console.log(
      `Processing payment ${paymentId} for invoice ${invoiceId} using role: ${role}`,
    );
    console.log(`🔍 Payment validation: toWallet=${toWallet}, amount=${amount}`);

    // Connect to Fabric using the specific role
    const { contract, gateway: g } = await connectFabric(role);
    gateway = g;

    // Call the ProcessPayment function from your Go chaincode
    const transaction = contract.createTransaction("ProcessPayment");
    await transaction.setEndorsingPeers(["peer0.org1.example.com"]);
    await transaction.submit(paymentId, invoiceId, amount, toWallet);
    
    console.log(`Payment ${paymentId} processed successfully for invoice ${invoiceId}`);
    res.json({ success: true, message: "Payment processed successfully" });
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Enhanced error reporting - extract chaincode errors
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        const chaincodeMessage = error.responses[0].response.message;
        console.error("🔍 Chaincode error message:", chaincodeMessage);
        
        // Send specific blockchain error with 400 status instead of generic 500
        return res.status(400).json({ 
          error: "Blockchain Validation Failed", 
          message: chaincodeMessage 
        });
      }
    }
    
    // Fallback for other errors
    res.status(400).json({ 
      error: 'Blockchain Validation Failed', 
      message: error.message 
    });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// POST /verify - Verify invoice (BUYER only)
router.post('/verify', validateRole(ROLES.BUYER), async (req, res) => {
    let gateway;
    try {
        console.log('Received Verification Data:', req.body); // Debug: Log incoming request body
        const { invoiceId, role } = req.body;
        
        if (!invoiceId) {
            return res.status(400).json({ error: 'Missing required field: invoiceId' });
        }

        console.log(`Verifying invoice ${invoiceId} using role: ${role}`);
        const { gateway: g, contract } = await connectFabric(role);
        gateway = g;
        
        const transaction = contract.createTransaction('VerifyInvoice');
        await transaction.setEndorsingPeers(['peer0.org1.example.com']);
        await transaction.submit(invoiceId);
        console.log(`Invoice ${invoiceId} verified successfully`);
        
        // Fetch the updated invoice details after verification
        const result = await contract.evaluateTransaction('ReadInvoice', invoiceId);
        const invoice = JSON.parse(result.toString());
        
        res.json({ 
            success: true, 
            message: 'Invoice verified successfully',
            invoice: invoice 
        });
        
    } catch (error) {
        console.error('POST /verify error:', error);
        
        // Log detailed peer response if available
        if (error.responses && error.responses.length > 0) {
            console.error('Peer response details:', error.responses[0].response);
            if (error.responses[0].response && error.responses[0].response.message) {
                console.error('Peer response message:', error.responses[0].response.message);
            }
        }
        
        // Ensure consistent JSON error response for blockchain errors
        res.status(400).json({ 
            error: 'Blockchain Validation Failed', 
            message: error.message 
        });
    } finally {
        if (gateway) {
            await gateway.disconnect();
        }
    }
});

// GET /invoices - Get all invoices (AUDITOR, ADMIN, INVESTOR only)
router.get(
  "/invoices",
  validateAnyRole([ROLES.AUDITOR, ROLES.ADMIN, ROLES.INVESTOR]),
  async (req, res) => {
    let gateway;
    try {
      const { role } = req.query;

      console.log(`Getting all invoices using role: ${role}`);
      const { gateway: g, contract } = await connectFabric(role);
      gateway = g;

      const result = await contract.evaluateTransaction("GetAllInvoices");
      const invoices = JSON.parse(result.toString());
      res.json(invoices);
    } catch (error) {
      console.error("GET /invoices error:", error);

      // Log detailed peer response if available
      if (error.responses && error.responses.length > 0) {
        console.error("Peer response details:", error.responses[0].response);
        if (
          error.responses[0].response &&
          error.responses[0].response.message
        ) {
          console.error(
            "Peer response message:",
            error.responses[0].response.message,
          );
        }
      }

      res.status(500).json({ error: error.message });
    } finally {
      if (gateway) {
        await gateway.disconnect();
      }
    }
  },
);

// GET /invoice/:id - Get a specific invoice by ID
router.get("/invoice/:id", async (req, res) => {
  let gateway;
  try {
    const { id } = req.params;
    const { role } = req.query;

    if (!role) {
      return res
        .status(400)
        .json({ error: "Role is required in query parameters" });
    }

    console.log(`Getting invoice ${id} using role: ${role}`);
    const { gateway: g, contract } = await connectFabric(role);
    gateway = g;

    const result = await contract.evaluateTransaction("ReadInvoice", id);
    const invoice = JSON.parse(result.toString());
    res.json(invoice);
  } catch (error) {
    console.error("GET /invoice/:id error:", error);

    // Log detailed peer response if available
    if (error.responses && error.responses.length > 0) {
      console.error("Peer response details:", error.responses[0].response);
      if (error.responses[0].response && error.responses[0].response.message) {
        console.error(
          "Peer response message:",
          error.responses[0].response.message,
        );
      }
    }

    res.status(500).json({ error: error.message });
  } finally {
    if (gateway) {
      await gateway.disconnect();
    }
  }
});

// GET /invoice/:id/history - Get complete transaction history for an invoice (AUDITOR, ADMIN, INVESTOR only)
router.get(
  "/invoice/:id/history",
  validateAnyRole([ROLES.AUDITOR, ROLES.ADMIN, ROLES.INVESTOR]),
  async (req, res) => {
    let gateway;
    try {
      const { id } = req.params;
      const { role } = req.query;

      console.log(`Getting invoice history for ${id} using role: ${role}`);
      const { gateway: g, contract } = await connectFabric(role);
      gateway = g;

      const result = await contract.evaluateTransaction(
        "GetInvoiceHistory",
        id,
      );
      const history = JSON.parse(result.toString());
      res.json(history);
    } catch (error) {
      console.error("GET /invoice/:id/history error:", error);

      // Log detailed peer response if available
      if (error.responses && error.responses.length > 0) {
        console.error("Peer response details:", error.responses[0].response);
        if (
          error.responses[0].response &&
          error.responses[0].response.message
        ) {
          console.error(
            "Peer response message:",
            error.responses[0].response.message,
          );
        }
      }

      res.status(500).json({ error: error.message });
    } finally {
      if (gateway) {
        await gateway.disconnect();
      }
    }
  },
);

// GET /invoice/:id/history - Get complete transaction history for an invoice (AUDITOR, ADMIN, INVESTOR only)
router.get(
  "/invoice/:id/history",
  validateAnyRole([ROLES.AUDITOR, ROLES.ADMIN, ROLES.INVESTOR]),
  async (req, res) => {
    let gateway;
    try {
      const { id } = req.params;
      const { role } = req.query; // Ensure the role is passed in the URL: ?role=INVESTOR

      console.log(`Getting invoice history for ${id} using role: ${role}`);
      const { gateway: g, contract } = await connectFabric(role);
      gateway = g;

      // This calls the GetInvoiceHistory function we talked about in the Go chaincode
      const result = await contract.evaluateTransaction(
        "GetInvoiceHistory",
        id,
      );
      const history = JSON.parse(result.toString());

      res.json(history);
    } catch (error) {
      console.error("GET /invoice/:id/history error:", error);
      res.status(500).json({ error: error.message });
    } finally {
      if (gateway) {
        await gateway.disconnect();
      }
    }
  },
);

module.exports = router;
