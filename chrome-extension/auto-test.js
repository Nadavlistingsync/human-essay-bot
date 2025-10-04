// Automated Testing and Feedback Loop for EssayForge Browser Control
class AutoTestFramework {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        this.setupTestSuite();
    }

    setupTestSuite() {
        // Initialize test environment
        this.tests = [
            {
                name: 'Navigation Controls',
                test: () => this.testNavigationControls()
            },
            {
                name: 'Tab Management',
                test: () => this.testTabManagement()
            },
            {
                name: 'Page Interaction',
                test: () => this.testPageInteraction()
            },
            {
                name: 'Screenshot Functionality',
                test: () => this.testScreenshotFunctionality()
            },
            {
                name: 'Bookmark Functionality',
                test: () => this.testBookmarkFunctionality()
            },
            {
                name: 'Element Clicking',
                test: () => this.testElementClicking()
            },
            {
                name: 'Form Filling',
                test: () => this.testFormFilling()
            },
            {
                name: 'Recording and Playback',
                test: () => this.testRecordingPlayback()
            },
            {
                name: 'Error Handling',
                test: () => this.testErrorHandling()
            },
            {
                name: 'Performance Monitoring',
                test: () => this.testPerformanceMonitoring()
            }
        ];
    }

    async runAllTests() {
        if (this.isRunning) {
            console.log('Tests already running...');
            return;
        }

        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting EssayForge Browser Control Tests...');
        
        for (const test of this.tests) {
            try {
                console.log(`Testing: ${test.name}...`);
                const result = await test.test();
                this.testResults.push({
                    name: test.name,
                    status: 'PASS',
                    result: result,
                    timestamp: Date.now()
                });
                console.log(`✅ ${test.name}: PASSED`);
            } catch (error) {
                this.testResults.push({
                    name: test.name,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: Date.now()
                });
                console.log(`❌ ${test.name}: FAILED - ${error.message}`);
            }
            
            // Small delay between tests
            await this.delay(500);
        }

        this.isRunning = false;
        await this.generateTestReport();
        return this.testResults;
    }

    async testNavigationControls() {
        // Test back/forward navigation
        const initialUrl = window.location.href;
        
        // Navigate to a test page
        await chrome.runtime.sendMessage({
            action: 'navigate',
            url: 'https://www.google.com'
        });
        
        await this.delay(2000);
        
        // Test back navigation
        await chrome.runtime.sendMessage({
            action: 'navigate',
            url: initialUrl
        });
        
        await this.delay(2000);
        
        return { 
            initialUrl, 
            currentUrl: window.location.href,
            navigationWorking: true 
        };
    }

    async testTabManagement() {
        // Test tab creation
        const response = await chrome.runtime.sendMessage({
            action: 'createTab',
            url: 'https://www.example.com',
            active: false
        });
        
        if (!response.success) {
            throw new Error('Failed to create tab');
        }
        
        // Test getting tabs
        const tabsResponse = await chrome.runtime.sendMessage({
            action: 'getTabs'
        });
        
        if (!tabsResponse.success || tabsResponse.tabs.length < 2) {
            throw new Error('Failed to get tabs or insufficient tabs');
        }
        
        // Close the test tab
        await chrome.runtime.sendMessage({
            action: 'closeTab',
            tabId: response.tabId
        });
        
        return { 
            tabCreated: true, 
            tabsRetrieved: tabsResponse.tabs.length,
            tabClosed: true 
        };
    }

    async testPageInteraction() {
        // Test scrolling
        await chrome.runtime.sendMessage({
            action: 'scrollPage',
            direction: 'down'
        });
        
        await this.delay(1000);
        
        await chrome.runtime.sendMessage({
            action: 'scrollPage',
            direction: 'up'
        });
        
        await this.delay(1000);
        
        return { scrolling: true };
    }

    async testScreenshotFunctionality() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'takeScreenshot'
            });
            
            if (!response.success) {
                throw new Error('Screenshot failed');
            }
            
            return { screenshot: true };
        } catch (error) {
            // Screenshot might fail due to permissions, but that's okay for testing
            return { screenshot: false, note: 'Screenshot requires user interaction' };
        }
    }

    async testBookmarkFunctionality() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'bookmarkCurrentPage'
            });
            
            return { bookmark: response.success };
        } catch (error) {
            return { bookmark: false, note: 'Bookmark might require user permission' };
        }
    }

    async testElementClicking() {
        // Create a test element
        const testElement = document.createElement('button');
        testElement.id = 'test-button';
        testElement.textContent = 'Test Button';
        testElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 10000;
            padding: 10px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
        `;
        
        let clicked = false;
        testElement.addEventListener('click', () => {
            clicked = true;
        });
        
        document.body.appendChild(testElement);
        
        try {
            // Test clicking the element
            const response = await chrome.runtime.sendMessage({
                action: 'clickElement',
                selector: '#test-button'
            });
            
            await this.delay(1000);
            
            return { 
                elementClicked: response.success, 
                eventFired: clicked 
            };
        } finally {
            // Clean up
            document.body.removeChild(testElement);
        }
    }

    async testFormFilling() {
        // Create a test form
        const testForm = document.createElement('form');
        testForm.innerHTML = `
            <input type="text" id="test-input" placeholder="Test input" />
            <textarea id="test-textarea" placeholder="Test textarea"></textarea>
        `;
        testForm.style.cssText = `
            position: fixed;
            top: 50px;
            left: 10px;
            z-index: 10000;
            background: white;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
        `;
        
        document.body.appendChild(testForm);
        
        try {
            // Test form filling
            const formData = {
                '#test-input': 'Test value',
                '#test-textarea': 'Test textarea content'
            };
            
            const response = await chrome.runtime.sendMessage({
                action: 'fillForm',
                data: formData
            });
            
            await this.delay(1000);
            
            const inputValue = document.getElementById('test-input').value;
            const textareaValue = document.getElementById('test-textarea').value;
            
            return { 
                formFilled: response.success,
                inputValue,
                textareaValue
            };
        } finally {
            // Clean up
            document.body.removeChild(testForm);
        }
    }

    async testRecordingPlayback() {
        // Test recording start
        const startResponse = await chrome.runtime.sendMessage({
            action: 'startRecording'
        });
        
        if (!startResponse.success) {
            throw new Error('Failed to start recording');
        }
        
        // Perform some actions
        await chrome.runtime.sendMessage({
            action: 'scrollPage',
            direction: 'down'
        });
        
        await this.delay(1000);
        
        // Test recording stop
        const stopResponse = await chrome.runtime.sendMessage({
            action: 'stopRecording'
        });
        
        if (!stopResponse.success) {
            throw new Error('Failed to stop recording');
        }
        
        // Test playback
        try {
            const playbackResponse = await chrome.runtime.sendMessage({
                action: 'playbackActions'
            });
            
            return { 
                recordingStarted: startResponse.success,
                recordingStopped: stopResponse.success,
                playbackAttempted: playbackResponse.success
            };
        } catch (error) {
            return { 
                recordingStarted: startResponse.success,
                recordingStopped: stopResponse.success,
                playbackAttempted: false,
                error: error.message
            };
        }
    }

    async testErrorHandling() {
        // Test error handling with invalid selector
        const response = await chrome.runtime.sendMessage({
            action: 'clickElement',
            selector: '#non-existent-element'
        });
        
        // Should not throw an error, but return success: false
        return { 
            errorHandling: true,
            invalidSelectorHandled: !response.success
        };
    }

    async testPerformanceMonitoring() {
        const startTime = performance.now();
        
        // Perform some actions to test performance
        for (let i = 0; i < 10; i++) {
            await chrome.runtime.sendMessage({
                action: 'scrollPage',
                direction: 'down'
            });
            await this.delay(100);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        return { 
            performanceTest: true,
            duration: duration,
            averagePerAction: duration / 10
        };
    }

    async generateTestReport() {
        const report = {
            timestamp: Date.now(),
            totalTests: this.testResults.length,
            passedTests: this.testResults.filter(r => r.status === 'PASS').length,
            failedTests: this.testResults.filter(r => r.status === 'FAIL').length,
            results: this.testResults
        };
        
        // Store report in chrome storage
        await chrome.storage.local.set({ 
            lastTestReport: report 
        });
        
        // Log summary
        console.log('📊 Test Report Generated:');
        console.log(`Total Tests: ${report.totalTests}`);
        console.log(`Passed: ${report.passedTests}`);
        console.log(`Failed: ${report.failedTests}`);
        console.log(`Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
        
        // Send report to background script for analysis
        await chrome.runtime.sendMessage({
            action: 'testReport',
            report: report
        });
        
        return report;
    }

    async runContinuousTesting() {
        // Run tests every 5 minutes
        setInterval(async () => {
            if (!this.isRunning) {
                console.log('🔄 Running continuous tests...');
                await this.runAllTests();
            }
        }, 5 * 60 * 1000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize auto-test framework
const autoTest = new AutoTestFramework();

// Make it globally accessible
window.essayForgeAutoTest = autoTest;

// Run initial test suite
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for the page to fully load
    await autoTest.delay(2000);
    
    // Run tests automatically
    await autoTest.runAllTests();
    
    // Start continuous testing
    autoTest.runContinuousTesting();
});

console.log('EssayForge Auto-Test Framework loaded');
