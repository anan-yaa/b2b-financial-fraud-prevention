/*
 SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Invoice struct {
	InvoiceID         string `json:"invoiceId"`
	Vendor           string `json:"vendor"`
	Buyer            string `json:"buyer"`
	Amount           string `json:"amount"`
	PurchaseOrderID  string `json:"purchaseOrderId"`
	DeliveryProofHash string `json:"deliveryProofHash"`
	Status           string `json:"status"`
	SystemValidated  bool   `json:"systemValidated"`
	BuyerApproved    bool   `json:"buyerApproved"`
	Timestamp        string `json:"timestamp"`
}

type PurchaseOrder struct {
	POID      string `json:"poId"`
	Vendor    string `json:"vendor"`
	Buyer     string `json:"buyer"`
	Amount    string `json:"amount"`
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

type Vendor struct {
	VendorID        string   `json:"vendorId"`
	Name            string   `json:"name"`
	Status          string   `json:"status"`
	MaxLimit        string   `json:"maxLimit"`
	Registered      string   `json:"registered"`
	AuthorizedWallet string  `json:"authorizedWallet"`
	CertifiedIdentity bool   `json:"certifiedIdentity"`
}

type Payment struct {
	PaymentID     string `json:"paymentId"`
	InvoiceID     string `json:"invoiceId"`
	Vendor        string `json:"vendor"`
	Amount        string `json:"amount"`
	ToWallet      string `json:"toWallet"`
	Status        string `json:"status"`
	Timestamp     string `json:"timestamp"`
}

const (
	StatusSubmitted = "SUBMITTED"
	StatusValidated = "VALIDATED"
	StatusVerified  = "VERIFIED"
	StatusFinanced  = "FINANCED"
	StatusRejected  = "REJECTED"
	POStatusActive   = "ACTIVE"
	VendorStatusActive = "ACTIVE"
	PaymentStatusPending = "PENDING"
	PaymentStatusCompleted = "COMPLETED"
)

func (s *SmartContract) CreateInvoice(ctx contractapi.TransactionContextInterface, invoiceId string, vendor string, buyer string, amount string, purchaseOrderId string, deliveryProofHash string) error {
	// Check if invoice already exists
	exists, err := s.InvoiceExists(ctx, invoiceId)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the invoice %s already exists", invoiceId)
	}

	// Pre-validation rules
	// 1. Check if vendor is registered and active
	isVendorValid, err := s.IsVendorRegistered(ctx, vendor)
	if err != nil {
		return fmt.Errorf("failed to validate vendor: %v", err)
	}
	if !isVendorValid {
		return fmt.Errorf("vendor %s is not registered or not active", vendor)
	}

	// 2. Check if PO exists and is active
	po, err := s.ReadPurchaseOrder(ctx, purchaseOrderId)
	if err != nil {
		return fmt.Errorf("failed to validate purchase order: %v", err)
	}
	if po.Status != POStatusActive {
		return fmt.Errorf("purchase order %s is not active", purchaseOrderId)
	}

	// 3. Check if amount is within contract limit
	vendorInfo, err := s.ReadVendor(ctx, vendor)
	if err != nil {
		return fmt.Errorf("failed to get vendor limit: %v", err)
	}
	invoiceAmount, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		return fmt.Errorf("invalid invoice amount: %v", err)
	}
	maxLimit, err := strconv.ParseFloat(vendorInfo.MaxLimit, 64)
	if err != nil {
		return fmt.Errorf("invalid vendor limit: %v", err)
	}
	if invoiceAmount > maxLimit {
		return fmt.Errorf("invoice amount %s exceeds vendor limit %s", amount, vendorInfo.MaxLimit)
	}

	// 4. Check delivery proof hash is provided
	if deliveryProofHash == "" {
		return fmt.Errorf("delivery proof hash is required")
	}

	// 5. Additional validation: Check PO belongs to the same vendor and buyer
	if po.Vendor != vendor {
		return fmt.Errorf("purchase order %s belongs to different vendor", purchaseOrderId)
	}
	if po.Buyer != buyer {
		return fmt.Errorf("purchase order %s belongs to different buyer", purchaseOrderId)
	}

	// Create invoice with system validation flag
	invoice := Invoice{
		InvoiceID:         invoiceId,
		Vendor:            vendor,
		Buyer:             buyer,
		Amount:            amount,
		PurchaseOrderID:   purchaseOrderId,
		DeliveryProofHash: deliveryProofHash,
		Status:            StatusSubmitted,
		SystemValidated:   true,  // System has validated all rules
		BuyerApproved:     false, // Buyer needs to approve
		Timestamp:         time.Now().Format(time.RFC3339),
	}

	invoiceJSON, err := json.Marshal(invoice)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(invoiceId, invoiceJSON)
}

func (s *SmartContract) VerifyInvoice(ctx contractapi.TransactionContextInterface, invoiceId string) error {
	invoice, err := s.ReadInvoice(ctx, invoiceId)
	if err != nil {
		return err
	}

	// Check if invoice is in submitted status
	if invoice.Status != StatusSubmitted {
		return fmt.Errorf("invoice %s cannot be verified, current status: %s", invoiceId, invoice.Status)
	}

	// Check if system has validated the invoice
	if !invoice.SystemValidated {
		return fmt.Errorf("invoice %s has not been system validated", invoiceId)
	}

	// Update status to validated (buyer approved)
	invoice.Status = StatusValidated
	invoice.BuyerApproved = true
	invoice.Timestamp = time.Now().Format(time.RFC3339)

	invoiceJSON, err := json.Marshal(invoice)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(invoiceId, invoiceJSON)
}

func (s *SmartContract) ApproveFinancing(ctx contractapi.TransactionContextInterface, invoiceId string) error {
	invoice, err := s.ReadInvoice(ctx, invoiceId)
	if err != nil {
		return err
	}

	// Multi-party approval check: Must be system validated AND buyer approved
	if !invoice.SystemValidated {
		return fmt.Errorf("invoice %s has not been system validated", invoiceId)
	}
	if !invoice.BuyerApproved {
		return fmt.Errorf("invoice %s has not been buyer approved", invoiceId)
	}

	// Check current status
	if invoice.Status != StatusValidated {
		return fmt.Errorf("invoice %s cannot be financed, current status: %s", invoiceId, invoice.Status)
	}

	// Approve financing - only after all validations and approvals
	invoice.Status = StatusFinanced
	invoice.Timestamp = time.Now().Format(time.RFC3339)

	invoiceJSON, err := json.Marshal(invoice)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(invoiceId, invoiceJSON)
}

func (s *SmartContract) GetAllInvoices(ctx contractapi.TransactionContextInterface) ([]*Invoice, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var invoices []*Invoice
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var invoice Invoice
		err = json.Unmarshal(queryResponse.Value, &invoice)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, &invoice)
	}

	return invoices, nil
}

func (s *SmartContract) ReadInvoice(ctx contractapi.TransactionContextInterface, invoiceId string) (*Invoice, error) {
	invoiceJSON, err := ctx.GetStub().GetState(invoiceId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if invoiceJSON == nil {
		return nil, fmt.Errorf("the invoice %s does not exist", invoiceId)
	}

	var invoice Invoice
	err = json.Unmarshal(invoiceJSON, &invoice)
	if err != nil {
		return nil, err
	}

	return &invoice, nil
}

func (s *SmartContract) InvoiceExists(ctx contractapi.TransactionContextInterface, invoiceId string) (bool, error) {
	invoiceJSON, err := ctx.GetStub().GetState(invoiceId)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return invoiceJSON != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating chaincode: %v", err)
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}
}

// Vendor management functions
func (s *SmartContract) RegisterVendor(ctx contractapi.TransactionContextInterface, vendorId string, name string, maxLimit string, authorizedWallet string) error {
	exists, err := s.VendorExists(ctx, vendorId)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("vendor %s already exists", vendorId)
	}

	vendor := Vendor{
		VendorID:          vendorId,
		Name:              name,
		Status:            VendorStatusActive,
		MaxLimit:          maxLimit,
		Registered:        time.Now().Format(time.RFC3339),
		AuthorizedWallet:  authorizedWallet,
		CertifiedIdentity: true, // Assume certified during registration
	}

	vendorJSON, err := json.Marshal(vendor)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("VENDOR_"+vendorId, vendorJSON)
}

func (s *SmartContract) ReadVendor(ctx contractapi.TransactionContextInterface, vendorId string) (*Vendor, error) {
	vendorJSON, err := ctx.GetStub().GetState("VENDOR_" + vendorId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if vendorJSON == nil {
		return nil, fmt.Errorf("the vendor %s does not exist", vendorId)
	}

	var vendor Vendor
	err = json.Unmarshal(vendorJSON, &vendor)
	if err != nil {
		return nil, err
	}

	return &vendor, nil
}

func (s *SmartContract) IsVendorRegistered(ctx contractapi.TransactionContextInterface, vendorId string) (bool, error) {
	vendor, err := s.ReadVendor(ctx, vendorId)
	if err != nil {
		return false, nil // Vendor doesn't exist
	}
	return vendor.Status == VendorStatusActive, nil
}

func (s *SmartContract) VendorExists(ctx contractapi.TransactionContextInterface, vendorId string) (bool, error) {
	vendorJSON, err := ctx.GetStub().GetState("VENDOR_" + vendorId)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return vendorJSON != nil, nil
}

// Purchase Order management functions
func (s *SmartContract) CreatePurchaseOrder(ctx contractapi.TransactionContextInterface, poId string, vendor string, buyer string, amount string) error {
	exists, err := s.PurchaseOrderExists(ctx, poId)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("purchase order %s already exists", poId)
	}

	po := PurchaseOrder{
		POID:      poId,
		Vendor:    vendor,
		Buyer:     buyer,
		Amount:    amount,
		Status:    POStatusActive,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	poJSON, err := json.Marshal(po)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("PO_"+poId, poJSON)
}

func (s *SmartContract) ReadPurchaseOrder(ctx contractapi.TransactionContextInterface, poId string) (*PurchaseOrder, error) {
	poJSON, err := ctx.GetStub().GetState("PO_" + poId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if poJSON == nil {
		return nil, fmt.Errorf("the purchase order %s does not exist", poId)
	}

	var po PurchaseOrder
	err = json.Unmarshal(poJSON, &po)
	if err != nil {
		return nil, err
	}

	return &po, nil
}

func (s *SmartContract) PurchaseOrderExists(ctx contractapi.TransactionContextInterface, poId string) (bool, error) {
	poJSON, err := ctx.GetStub().GetState("PO_" + poId)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return poJSON != nil, nil
}

// Payment and Fund Diversion Prevention Functions
func (s *SmartContract) ProcessPayment(ctx contractapi.TransactionContextInterface, paymentId string, invoiceId string, amount string, toWallet string) error {
	// Rule 1: Invoice must be approved and financed
	invoice, err := s.ReadInvoice(ctx, invoiceId)
	if err != nil {
		return fmt.Errorf("failed to read invoice: %v", err)
	}
	if invoice.Status != StatusFinanced {
		return fmt.Errorf("invoice %s is not approved for payment. Current status: %s", invoiceId, invoice.Status)
	}

	// Rule 2: Vendor must match invoice vendor
	vendor, err := s.ReadVendor(ctx, invoice.Vendor)
	if err != nil {
		return fmt.Errorf("failed to read vendor: %v", err)
	}

	// Rule 3: Amount must match invoice amount
	if amount != invoice.Amount {
		return fmt.Errorf("payment amount %s does not match invoice amount %s", amount, invoice.Amount)
	}

	// Rule 4: Payment must go to authorized wallet only
	if toWallet != vendor.AuthorizedWallet {
		return fmt.Errorf("payment wallet %s is not authorized for vendor %s. Authorized wallet: %s", toWallet, invoice.Vendor, vendor.AuthorizedWallet)
	}

	// Rule 5: Vendor must have certified identity
	if !vendor.CertifiedIdentity {
		return fmt.Errorf("vendor %s does not have certified identity", invoice.Vendor)
	}

	// Create payment record
	payment := Payment{
		PaymentID: paymentId,
		InvoiceID: invoiceId,
		Vendor:    invoice.Vendor,
		Amount:    amount,
		ToWallet:  toWallet,
		Status:    PaymentStatusCompleted,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	paymentJSON, err := json.Marshal(payment)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("PAYMENT_"+paymentId, paymentJSON)
}

func (s *SmartContract) ReadPayment(ctx contractapi.TransactionContextInterface, paymentId string) (*Payment, error) {
	paymentJSON, err := ctx.GetStub().GetState("PAYMENT_" + paymentId)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if paymentJSON == nil {
		return nil, fmt.Errorf("the payment %s does not exist", paymentId)
	}

	var payment Payment
	err = json.Unmarshal(paymentJSON, &payment)
	if err != nil {
		return nil, err
	}

	return &payment, nil
}

func (s *SmartContract) GetVendorAuthorizedWallet(ctx contractapi.TransactionContextInterface, vendorId string) (string, error) {
	vendor, err := s.ReadVendor(ctx, vendorId)
	if err != nil {
		return "", fmt.Errorf("failed to read vendor: %v", err)
	}
	return vendor.AuthorizedWallet, nil
}

// No free transfer function allowed - this prevents unauthorized transfers
// Any transfer must be linked to a specific, approved invoice
