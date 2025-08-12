# 🤖 WhatsApp Automation Suite

Professional WhatsApp Web automation solution built with Playwright for comprehensive campaign testing and customer interaction workflows.

## 🌟 Features

### ✅ **Complete Automation Workflow**
- 🌐 **Smart Navigation** - Automatic WhatsApp Web loading with retry logic
- 🔐 **Login Detection** - Handles both QR code and already-logged-in scenarios
- 📱 **Contact Management** - Search and open conversations by phone number
- 💬 **Message Automation** - Send trigger keywords and handle responses
- 🎯 **Interactive Elements** - Click buttons, fill forms, handle UI interactions
- 📄 **File Upload** - Automatic image/receipt upload with fallback options
- 🤖 **Agent Integration** - Seamless transition to human agent conversations
- 📸 **Visual Documentation** - Complete video recording and screenshot capture

### 🏢 **Enterprise-Grade Testing**
- 🎬 **Video Recording** - Full automation sessions recorded in HD (WebM format)
- 📊 **Comprehensive Reporting** - Detailed HTML and JSON test reports
- 🔄 **Retry Mechanisms** - Intelligent error handling with multiple attempts
- ⚡ **Performance Optimized** - Fast execution with smart timeouts
- 🛡️ **Error Resilience** - Graceful failure handling with detailed logging

## 📁 Project Structure

```
whatsappAuto/
├── 🧪 tests/
│   └── whatsapp-automation.spec.js    # Main Playwright test specification
├── 🛠️ utils/
│   └── create-test-image.js           # Automatic test image generator
├── 📸 screenshots/                    # Step-by-step automation screenshots
├── 🖼️ test-images/                     # Generated test files for upload
├── 📊 test-results/                   # Playwright reports and videos
├── 🎥 videos/                         # Recorded automation sessions
├── ⚙️ playwright.config.js            # Playwright framework configuration
├── 📦 package.json                    # Dependencies and npm scripts
└── 📖 README.md                       # This documentation
```

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** v16+ ([Download here](https://nodejs.org/))
- **Google Chrome** browser
- **Windows 10/11** (PowerShell)

### 📥 Installation
```bash
# Clone or navigate to project directory
cd whatsappAuto

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### ⚙️ Configuration

Edit the configuration in `tests/whatsapp-automation.spec.js`:

```javascript
const CONFIG = {
  contactNumber: "+60 3-9771 1660",     // 📱 Target WhatsApp contact
  triggerMessage: "kuhentest",          // 🎯 Campaign trigger keyword
  userName: "John Doe",                 // 👤 User name for forms
  agentMessage: "Hello, I need assistance with my recent transaction. Can you please help me?",
  timeouts: {
    qrScan: 120000,      // ⏱️ QR code scan timeout (2 minutes)
    buttonWait: 60000,   // ⏱️ Button appearance timeout (1 minute)
    messageDelay: 3000,  // ⏱️ Delay between messages
    errorDelay: 5000,    // ⏱️ Delay between error messages
    receiptUpload: 15000 // ⏱️ Receipt upload wait time
  }
};
```

## 🎮 Usage

### 🏃‍♂️ Run Automation

```bash
# 👀 Visible browser mode (recommended for development)
npm run test:whatsapp:headed

# 🔍 Debug mode with step-by-step control
npm run test:whatsapp:debug

# 🖥️ Headless mode (faster, no browser UI)
npm run test:whatsapp

# 🎛️ Interactive Playwright UI
npm run test:ui

# 📊 View latest test report
npm run show:report
```

### 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run test:whatsapp:headed` | 👀 Run with visible browser |
| `npm run test:whatsapp:debug` | 🔍 Debug mode with breakpoints |
| `npm run test:whatsapp` | 🚄 Fast headless execution |
| `npm run test:ui` | 🎛️ Interactive Playwright UI |
| `npm run show:report` | 📊 Open latest HTML report |

## 🔄 Automation Workflow

The automation follows this comprehensive 10-step process:

### 1. 🌐 **Navigation & Setup**
- Opens WhatsApp Web in optimized browser
- Configures video recording and screenshot capture
- Sets up anti-detection browser settings

### 2. 🔐 **Smart Login Detection**
- Automatically detects if QR code scan is required
- Handles already-logged-in scenarios
- Waits for chat interface to load completely

### 3. 📱 **Contact Search & Selection**
- Searches for target phone number (`+60 3-9771 1660`)
- Uses multiple selector fallbacks for reliability
- Opens conversation when contact is found

### 4. 💬 **Trigger Message**
- Sends campaign keyword (`kuhentest`)
- Waits for automated response from system
- Captures screenshots of message exchange

### 5. 🎯 **Proceed Button Interaction**
- Waits for "Proceed" button to appear after trigger
- Checks button enablement status
- Clicks when available and enabled

### 6. 👤 **User Information Submission**
- Sends user name (`John Doe`)
- Handles form submission responses
- Proceeds to next automation phase

### 7. ❌ **Error Sequence Testing**
- Sends predefined error messages: `123`, `Hello`, `✅✅✅`
- Tests system error handling capabilities
- Documents all error responses

### 8. 📄 **File Upload Automation**
- Automatically generates test image (1x1 PNG)
- Finds and clicks attachment button
- Uploads receipt/document with fallback options
- Handles file picker interactions

### 9. 🤖 **Agent Chat Transition**
- Waits for "Chat with Agent" button
- Initiates human agent conversation
- Handles transition timing

### 10. 💬 **Final Agent Inquiry**
- Sends detailed support message
- Completes full customer journey simulation
- Captures final automation state

## 📊 Output & Results

### 🎥 **Video Recordings**
- **Location**: `test-results/videos/`
- **Format**: WebM (1280x720 HD)
- **Content**: Complete automation session from start to finish
- **Usage**: Review automation behavior, debug issues, create documentation

### 📸 **Screenshots**
- **Location**: `screenshots/`
- **Format**: PNG (Full page captures)
- **Timing**: Before/after every major step
- **Naming**: Timestamped with step descriptions

### 📊 **Test Reports**
- **HTML Report**: Rich visual report with embedded videos
- **JSON Report**: Machine-readable test results
- **Error Details**: Stack traces and failure context
- **Performance Metrics**: Timing and execution statistics

### 🖼️ **Test Assets**
- **Test Images**: Auto-generated in `test-images/`
- **Upload Files**: Ready-to-use receipt mockups
- **Reusable**: Perfect for repeated testing

## 🔧 Advanced Configuration

### 🎛️ **Playwright Settings**
```javascript
// In playwright.config.js
module.exports = defineConfig({
  timeout: 300000,           // 5-minute test timeout
  retries: 0,               // No automatic retries (manual control)
  workers: 1,               // Single worker for WhatsApp session
  video: 'on',              // Always record videos
  screenshot: 'only-on-failure'
});
```

### 🚀 **Browser Optimization**
```javascript
// Anti-detection settings
launchOptions: {
  args: [
    '--no-first-run',
    '--disable-blink-features=AutomationControlled',
    '--disable-web-security',
    '--no-sandbox'
  ]
}
```

### ⏱️ **Timeout Customization**
```javascript
const CONFIG = {
  timeouts: {
    qrScan: 120000,      // Increase for slow QR scanning
    buttonWait: 60000,   // Increase for slow UI responses
    messageDelay: 3000,  // Adjust message sending pace
    errorDelay: 5000,    // Control error message timing
    receiptUpload: 15000 // File upload wait time
  }
};
```

## 🛠️ Troubleshooting

### 🚨 **Common Issues & Solutions**

#### 1. **QR Code Appears**
```
Issue: WhatsApp requires QR code scan
Solution: Scan the QR code manually when browser opens
Status: Normal behavior for first-time setup
```

#### 2. **Contact Not Found**
```
Issue: Phone number search fails
Solutions:
- Verify number format: +60 3-9771 1660
- Ensure contact exists in WhatsApp
- Check network connectivity
```

#### 3. **Button Not Found**
```
Issue: "Proceed" button doesn't appear
Solutions:
- Verify trigger message sent correctly
- Check WhatsApp bot response timing
- Review automation flow sequence
```

#### 4. **Upload Fails**
```
Issue: File upload doesn't work
Solutions:
- Check file permissions
- Verify test image creation
- Try manual file selection (15-second window)
```

#### 5. **Browser Closes Unexpectedly**
```
Issue: WhatsApp detects automation
Solutions:
- Use headed mode: npm run test:whatsapp:headed
- Check anti-detection browser settings
- Verify Playwright version compatibility
```

### 🔍 **Debug Mode**
```bash
# Step-by-step debugging
npm run test:whatsapp:debug

# Interactive UI mode
npm run test:ui

# Verbose logging
DEBUG=pw:api npm run test:whatsapp
```

### 📋 **Debug Checklist**
- [ ] Node.js version 16+ installed
- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] WhatsApp Web accessible in regular browser
- [ ] Contact number exists and format is correct
- [ ] Internet connection stable
- [ ] No antivirus blocking automation

## 🎯 Use Cases

### 📈 **Campaign Testing**
- Test marketing campaign flows
- Validate automated responses
- Verify customer journey completion
- A/B test different trigger keywords

### 🔍 **Quality Assurance**
- Regression testing for WhatsApp bots
- UI/UX validation for chat interfaces
- Performance testing under load
- Error handling verification

### 📊 **Customer Experience**
- End-to-end journey mapping
- Response time measurement
- Agent handoff testing
- Support ticket creation validation

### 🚀 **Development Support**
- Automated testing in CI/CD pipelines
- Bug reproduction and debugging
- Feature validation before deployment
- Integration testing with backend systems

## 🔐 Security & Compliance

### ⚠️ **Important Notes**
- **Educational Purpose**: This tool is for testing and educational use only
- **WhatsApp ToS**: Ensure compliance with WhatsApp Terms of Service
- **Rate Limiting**: Respect WhatsApp's usage limitations
- **Data Privacy**: Handle test data according to privacy regulations

### 🛡️ **Best Practices**
- Use dedicated test WhatsApp accounts
- Avoid sending spam or unwanted messages
- Implement proper error handling
- Log activities for audit purposes
- Regular security updates

## 🤝 Contributing

### 🐛 **Found a Bug?**
1. Check existing issues
2. Create detailed bug report
3. Include screenshots/videos
4. Provide reproduction steps

### 💡 **Feature Request?**
1. Describe the feature
2. Explain the use case
3. Provide implementation suggestions
4. Consider backward compatibility

### 🔧 **Development Setup**
```bash
# Install development dependencies
npm install --include=dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Disclaimer**: This automation tool is provided for educational and testing purposes only. Users are responsible for ensuring compliance with WhatsApp's Terms of Service and applicable laws and regulations.

---

## 📞 Support

For questions, issues, or feature requests:
- 📧 **Email**: [Your contact email]
- 🐛 **Issues**: [GitHub Issues](link)
- 📖 **Documentation**: This README
- 💬 **Discussions**: [GitHub Discussions](link)

---

**Made with ❤️ using Playwright and Node.js**

*Last updated: August 8, 2025*
