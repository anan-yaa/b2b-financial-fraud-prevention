# B2B Financial Fraud Prevention System

A Hyperledger Fabric-based blockchain solution for preventing financial fraud in B2B transactions, specifically targeting invoice financing, fund diversion, and double financing scenarios.

## Overview

This system implements a comprehensive fraud prevention mechanism using blockchain technology to ensure transparency, immutability, and multi-party validation in financial transactions between vendors, buyers, and banks.

## Fraud Prevention Features

### 1. Fake Invoice Prevention
- **Pre-validation Rules**: Every invoice undergoes mandatory validation:
  - Vendor registration verification
  - Purchase order existence and active status check
  - Amount validation against vendor's contract limit
  - Delivery proof hash requirement
  - Unique invoice ID enforcement
- **Multi-party Approval**: Invoices require both system validation and buyer approval
- **Timestamping**: All transactions are timestamped for audit trails

### 2. Fund Diversion Prevention
- **Authorized Wallet Registry**: Each vendor registers an authorized cryptocurrency wallet
- **Certified Identity**: Vendors must have certified identity verification
- **Linked Invoice Payments**: Payments can only be made against approved invoices
- **Amount Matching**: Payment amounts must exactly match invoice amounts
- **No Free Transfers**: No standalone transfer functions exist

### 3. Financial Misreporting Prevention
- **Immutable Ledger**: All financial data is stored on blockchain with immutability
- **Digital Signatures**: Every transaction is cryptographically signed
- **Real-time Visibility**: Authorized parties have real-time read access
- **Audit Trail**: Complete transaction history with timestamps

### 4. Double Financing Prevention
- **Unique Invoice Hash**: Each invoice receives a unique hash identifier
- **Status Locking**: Invoice states prevent multiple financing attempts
- **Single Source of Truth**: Blockchain serves as the authoritative record

## System Architecture

### Components
- **Hyperledger Fabric Network**: Blockchain infrastructure
- **Go Chaincode**: Smart contracts for business logic
- **Node.js API Server**: RESTful API for client interactions
- **Express.js**: Web framework for API endpoints
- **Fabric SDK**: Node.js SDK for blockchain integration

### Participants
- **Vendor**: Submits invoices and receives payments
- **Buyer**: Verifies invoices and approves transactions
- **Bank**: Provides financing and processes payments
- **Auditor**: Monitors transactions for compliance

## Prerequisites

- Node.js 14.x or higher
- Go 1.14 or higher
- Docker and Docker Compose
- Hyperledger Fabric binaries and samples
- Git

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/anan-yaa/b2b-financial-fraud-prevention.git
cd b2b-financial-fraud-prevention
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Go dependencies
cd chaincode
go mod tidy
cd ..
```

### 3. Setup Hyperledger Fabric
```bash
# Download Fabric binaries and samples
curl -sSL https://bit.ly/2ysbOFE | bash -s

# Set environment variables
export PATH=${PWD}/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/config/
```

## Configuration

### Connection Profile
Update `fabric/connection-org1.json` with your network configuration:
- Peer endpoints
- Orderer endpoints
- Certificate authority URLs
- TLS certificate paths

### Environment Variables
Create `.env` file for sensitive configuration:
```
PORT=3000
FABRIC_NETWORK=mychannel
CHAINCODE_NAME=basic
```

## Usage

### 1. Start the Fabric Network
```bash
cd fabric-samples/test-network
./network.sh up createChannel
```

### 2. Deploy Chaincode
```bash
./network.sh deployCC -ccn basic -ccp ../chaincode -ccl go
```

### 3. Enroll Admin Identity
```bash
cd ../../
node enrollAdmin.js
```

### 4. Import Additional Identities
```bash
node importIdentity.js
```

### 5. Start the API Server
```bash
node app.js
```

The API server will start on `http://localhost:3000`

## API Endpoints

### Vendor Management
- `POST /vendor` - Register a new vendor
- `POST /purchaseOrder` - Create a purchase order

### Invoice Operations
- `POST /invoice` - Create a new invoice (Vendor only)
- `POST /verify` - Verify an invoice (Buyer only)
- `POST /finance` - Approve financing (Bank only)

### Query Operations
- `GET /invoices` - Get all invoices (Auditor, Bank only)
- `GET /invoice/:id` - Get specific invoice by ID

### Request Format
All POST requests require a `role` parameter:
```json
{
  "field1": "value1",
  "field2": "value2",
  "role": "VENDOR|BUYER|BANK|AUDITOR"
}
```

## Chaincode Functions

### Core Functions
- `RegisterVendor(vendorId, name, maxLimit, authorizedWallet)`
- `CreatePurchaseOrder(poId, vendor, buyer, amount)`
- `CreateInvoice(invoiceId, vendor, buyer, amount, purchaseOrderId, deliveryProofHash)`
- `VerifyInvoice(invoiceId)`
- `ApproveFinancing(invoiceId)`
- `ProcessPayment(paymentId, invoiceId, amount, toWallet)`

### Query Functions
- `GetAllInvoices()` - Returns all invoices
- `ReadInvoice(invoiceId)` - Returns specific invoice
- `ReadVendor(vendorId)` - Returns vendor information
- `GetVendorAuthorizedWallet(vendorId)` - Returns authorized wallet

## Security Features

### Access Control
- Role-based access control for all operations
- Identity verification through Fabric CA
- Transaction endorsement policies

### Data Protection
- All sensitive data encrypted on blockchain
- Private data collections for confidential information
- TLS encryption for all network communications

### Audit Trail
- Complete transaction history
- Immutable timestamp records
- Digital signatures for all participants

## Testing

### Unit Tests
```bash
# Run Node.js tests
npm test

# Run Go tests
cd chaincode
go test
```

### Integration Tests
```bash
# Test API endpoints
curl -X POST "http://localhost:3000/vendor" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "VEND001",
    "name": "Test Vendor",
    "maxLimit": "100000",
    "authorizedWallet": "0xABC123",
    "role": "ADMIN"
  }'
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify Fabric network is running
   - Check connection profile configuration
   - Ensure TLS certificates are valid

2. **Identity Not Found**
   - Run enrollAdmin.js to create admin identity
   - Check wallet directory contents
   - Verify identity certificates

3. **Endorsement Policy Failure**
   - Ensure required peers are available
   - Check transaction endorsement requirements
   - Verify organization membership

### Debug Mode
Enable detailed logging by setting:
```bash
export HFC_LOGGING=debug
export GRPC_TRACE=all
export GRPC_VERBOSITY=debug
```

## Project Structure

```
b2b-financial-fraud-prevention/
├── chaincode/                  # Go chaincode
│   ├── go.mod                  # Go module definition
│   ├── go.sum                  # Go dependencies
│   └── invoice_financing.go    # Main chaincode
├── fabric/                     # Fabric configuration
│   └── connection-org1.json    # Connection profile
├── wallet/                     # Fabric wallet (gitignored)
├── vendor/                     # Go dependencies (gitignored)
├── app.js                      # Express server
├── fabric.js                   # Fabric connection logic
├── routes.js                   # API routes
├── enrollAdmin.js              # Admin enrollment
├── importIdentity.js           # Identity management
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

