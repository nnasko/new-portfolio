# Inquiry Workflow Integration

## Overview
The admin dashboard now has a fully integrated workflow that connects inquiries, legal documents, and invoices. When an inquiry status is set to "ACCEPTED", users can seamlessly create related documents.

## New Features

### 1. Enhanced Inquiry Status Workflow
- **QUOTED Status**: When inquiry status is set to "QUOTED", a client creation form appears:
  - Captures full client details (first name, last name, company, email, phone, address)
  - Sets final project price (replaces estimate ranges)
  - Creates client record in database
  - Links inquiry to client for future reference
  
- **ACCEPTED Status**: When inquiry status is set to "ACCEPTED", workflow action buttons appear:
  - **Create Service Agreement** - Pre-fills legal document form with final price and client details
  - **Create Invoice** - Opens invoice creation with exact pricing and client information

### 2. Cross-Tab Integration
- **Visual Workflow Indicators**: Active workflow shows which tabs are involved
- **Pre-filled Forms**: Inquiry data automatically populates relevant fields
- **Smart Navigation**: Seamless switching between related documents

### 3. Enhanced User Experience
- **Visual Feedback**: Progress indicators and status messages
- **Workflow Cancellation**: Ability to cancel mid-workflow
- **Tab Highlighting**: Shows which tabs are part of active workflow

## Implementation Details

### Components Updated
- `InquiriesTab.tsx` - Added workflow action buttons
- `LegalTab.tsx` - Added inquiry pre-filling support
- `InvoicesTab.tsx` - Added inquiry pre-filling support
- `AdminPage.tsx` - Added workflow state management

### Enhanced Workflow Process
1. User reviews inquiry and sets status to "QUOTED"
2. Client creation modal appears with pre-filled inquiry data
3. User enters complete client details and final project price
4. System creates client record and updates inquiry with final pricing
5. When client accepts, user sets status to "ACCEPTED"
6. Inquiry detail view shows "Next Steps" section with workflow actions
7. User clicks "Create Service Agreement" or "Create Invoice"
8. System switches to relevant tab with client and pricing data pre-filled
9. User completes document creation using exact client details and final price
10. Workflow tracking maintains connection between inquiry, client, and documents

## Database Schema Recommendations

For full implementation, consider adding these fields:

### Inquiries Table
```sql
ALTER TABLE Inquiry ADD COLUMN relatedInvoiceId String?;
ALTER TABLE Inquiry ADD COLUMN relatedAgreementId String?;
ALTER TABLE Inquiry ADD COLUMN workflowStatus String DEFAULT 'INQUIRY'; 
-- INQUIRY → AGREEMENT_CREATED → INVOICE_CREATED → COMPLETED
```

### Invoices Table
```sql
ALTER TABLE Invoice ADD COLUMN sourceInquiryId String?;
ALTER TABLE Invoice ADD COLUMN estimatedAmount Float?;
```

### Legal Documents Table
```sql
ALTER TABLE ServiceAgreement ADD COLUMN sourceInquiryId String?;
```

## Benefits

1. **Streamlined Process**: No manual data re-entry between stages
2. **Better Tracking**: Clear connection between inquiry and final documents
3. **Improved UX**: Visual feedback and guided workflow
4. **Data Integrity**: Maintains relationship between related documents
5. **Efficiency**: Reduces time from inquiry to invoice/agreement creation

## Future Enhancements

- **Workflow History**: Track complete customer journey
- **Automated Status Updates**: Update inquiry status when documents are created
- **Email Integration**: Automatic notifications at each workflow stage
- **Dashboard Analytics**: Track conversion rates from inquiry to payment
- **Client Portal**: Let clients see workflow progress

## Usage

### Phase 1: Quote Creation
1. Navigate to Admin → Inquiries
2. Find new inquiry and review details
3. Set status to "QUOTED"
4. Fill out client creation form with complete details
5. Set final project price
6. Submit to create client record

### Phase 2: Document Creation (when client accepts)
1. Set inquiry status to "ACCEPTED" 
2. Click "View Details" to see workflow actions
3. Use "Create Service Agreement" or "Create Invoice" buttons
4. Complete document creation with pre-filled client and pricing data
5. Workflow automatically tracks all connections

## Key Benefits of Enhanced Workflow
- **No Duplicate Data Entry**: Client details entered once during quoting
- **Accurate Pricing**: Final price set during quote phase, not estimates
- **Complete Client Records**: Full contact information for professional documents
- **Workflow Tracking**: Clear progression from inquiry → quote → client → documents
- **Professional Process**: Structured approach matching real business practices 