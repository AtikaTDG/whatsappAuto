# WhatsApp Automation - Separated Test Specs

This directory contains modular test specifications for WhatsApp automation. Each test file focuses on a specific part of the automation workflow.

## Test Files Overview

### 1. `01-whatsapp-login.spec.js`
**Purpose**: Handle WhatsApp Web login and QR code scanning
- Navigate to WhatsApp Web
- Handle QR code scanning (with user prompt)
- Wait for login completion
- Verify login status

**Usage**:
```bash
npx playwright test tests/01-whatsapp-login.spec.js --headed
```

### 2. `02-contact-search.spec.js`
**Purpose**: Search for and open a contact by phone number
- Search for contact using phone number
- Handle multiple search box selectors
- Click on contact result
- Verify contact is opened

**Usage**:
```bash
npx playwright test tests/02-contact-search.spec.js --headed
```

### 3. `03-trigger-message.spec.js`
**Purpose**: Send trigger message and handle proceed button
- Send the trigger message ("kuhentest")
- Wait for bot response
- Find and click "Proceed" button
- Wait for button to be enabled before clicking

**Usage**:
```bash
npx playwright test tests/03-trigger-message.spec.js --headed
```

### 4. `04-name-validation.spec.js`
**Purpose**: Test name validation with error sequence
- Send invalid names (123, Hello123, ✅✅✅)
- Validate system rejection of invalid names
- **Test fails if system accepts invalid names**
- Send correct name after error sequence
- Verify correct name acceptance

**Usage**:
```bash
npx playwright test tests/04-name-validation.spec.js --headed
```

### 5. `05-receipt-upload.spec.js`
**Purpose**: Upload receipt/document image
- Find attachment button
- Click on "Photos & Videos" option
- Upload real Watsons receipt image
- Send the uploaded image

**Usage**:
```bash
npx playwright test tests/05-receipt-upload.spec.js --headed
```

### 6. `06-agent-communication.spec.js`
**Purpose**: Chat with agent functionality
- Wait for receipt processing
- Click "Chat with Agent" button
- Send agent inquiry message
- Complete automation workflow

**Usage**:
```bash
npx playwright test tests/06-agent-communication.spec.js --headed
```

### 7. `07-full-automation.spec.js`
**Purpose**: Complete end-to-end automation workflow
- Combines all steps from 1-6 into a single test
- Full automation from login to agent communication
- Includes all validation and error handling
- Comprehensive workflow for complete testing

**Usage**:
```bash
npx playwright test tests/07-full-automation.spec.js --headed
```

## Running Tests

### Individual Test Steps
Run each test step individually:
```bash
# Step 1: Login
npx playwright test tests/01-whatsapp-login.spec.js --headed

# Step 2: Contact Search  
npx playwright test tests/02-contact-search.spec.js --headed

# Step 3: Trigger Message
npx playwright test tests/03-trigger-message.spec.js --headed

# Step 4: Name Validation
npx playwright test tests/04-name-validation.spec.js --headed

# Step 5: Receipt Upload
npx playwright test tests/05-receipt-upload.spec.js --headed

# Step 6: Agent Communication
npx playwright test tests/06-agent-communication.spec.js --headed
```

### Full End-to-End Test
Run the complete automation:
```bash
npx playwright test tests/07-full-automation.spec.js --headed
```

### Run All Tests in Sequence
```bash
npx playwright test tests/ --headed
```

## Configuration

Each test file contains its own configuration section with relevant settings:

- **Contact Number**: `+60 3-9771 1660`
- **Trigger Message**: `kuhentest`
- **User Name**: `Atika`
- **Receipt Path**: `c:\Users\User\Downloads\testqa1.jpg`
- **Agent Message**: Pre-defined inquiry message

## Key Features

### Video Recording
All tests include video recording:
- Saved to `./test-results/videos/`
- Resolution: 1280x720
- Format: WebM

### Screenshots
Comprehensive screenshot capture:
- After each major step
- Error scenarios
- Validation points
- Saved to `screenshots/` directory

### Error Handling
- Robust selector fallbacks
- Multiple retry mechanisms
- Detailed error logging
- Debug screenshots on failures

### Validation
- **Name validation**: Tests system rejection of invalid names
- **Test failure**: Tests fail if validation doesn't work properly
- **Success verification**: Confirms correct inputs are accepted

## Prerequisites

1. **Real Receipt Image**: Ensure `c:\Users\User\Downloads\testqa1.jpg` exists
2. **WhatsApp Web Access**: Login manually for first-time setup
3. **Contact Available**: Target contact must be accessible
4. **Playwright**: Installed with Chromium browser

## Benefits of Separation

1. **Modularity**: Test individual components
2. **Debugging**: Isolate issues to specific steps
3. **Development**: Build and test incrementally
4. **Maintenance**: Update specific functionality easily
5. **Parallel Execution**: Run multiple tests simultaneously
6. **Selective Testing**: Run only required test steps
