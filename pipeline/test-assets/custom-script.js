// Custom JavaScript for Jest HTML Test Reports

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MHM Sales Automation Test Report Enhanced!');
    
    // Add progress bars to coverage items
    addCoverageProgressBars();
    
    // Add interactive features
    addTestSuiteToggle();
    
    // Add search functionality
    addTestSearch();
    
    // Add report timestamp
    addReportTimestamp();
    
    // Add auto-refresh capability
    addAutoRefresh();
    
    // Add export functionality
    addExportFeatures();
});

function addCoverageProgressBars() {
    const coverageItems = document.querySelectorAll('.coverage-item');
    
    coverageItems.forEach(item => {
        const percentageText = item.querySelector('.coverage-percentage')?.textContent;
        const percentage = parseFloat(percentageText);
        
        if (!isNaN(percentage)) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            progressFill.style.width = percentage + '%';
            
            progressBar.appendChild(progressFill);
            item.appendChild(progressBar);
            
            // Color based on coverage level
            if (percentage >= 90) {
                progressFill.style.background = '#48bb78'; // Green
            } else if (percentage >= 70) {
                progressFill.style.background = '#ed8936'; // Orange
            } else {
                progressFill.style.background = '#f56565'; // Red
            }
        }
    });
}

function addTestSuiteToggle() {
    const suiteHeaders = document.querySelectorAll('.test-suite-header');
    
    suiteHeaders.forEach(header => {
        const suite = header.closest('.test-suite');
        const testCases = suite.querySelectorAll('.test-case');
        
        if (testCases.length > 0) {
            header.style.cursor = 'pointer';
            header.title = 'Click to toggle test cases';
            
            // Add toggle icon
            const toggleIcon = document.createElement('span');
            toggleIcon.textContent = '▼';
            toggleIcon.style.marginLeft = '10px';
            toggleIcon.style.transition = 'transform 0.3s ease';
            header.appendChild(toggleIcon);
            
            header.addEventListener('click', function() {
                const isVisible = testCases[0].style.display !== 'none';
                
                testCases.forEach(testCase => {
                    testCase.style.display = isVisible ? 'none' : 'flex';
                });
                
                toggleIcon.style.transform = isVisible ? 'rotate(-90deg)' : 'rotate(0deg)';
            });
        }
    });
}

function addTestSearch() {
    const container = document.querySelector('.container');
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '20px';
    searchContainer.style.textAlign = 'center';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search tests...';
    searchInput.style.padding = '10px 15px';
    searchInput.style.borderRadius = '25px';
    searchInput.style.border = '1px solid #4a5568';
    searchInput.style.background = 'rgba(255, 255, 255, 0.1)';
    searchInput.style.color = '#e2e8f0';
    searchInput.style.fontSize = '14px';
    searchInput.style.minWidth = '300px';
    
    searchContainer.appendChild(searchInput);
    container.insertBefore(searchContainer, container.querySelector('.test-suites'));
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const testSuites = document.querySelectorAll('.test-suite');
        
        testSuites.forEach(suite => {
            const suiteName = suite.querySelector('.test-suite-name')?.textContent.toLowerCase() || '';
            const testCases = suite.querySelectorAll('.test-case');
            let hasMatchingTest = false;
            
            testCases.forEach(testCase => {
                const testName = testCase.querySelector('.test-name')?.textContent.toLowerCase() || '';
                const matches = testName.includes(searchTerm) || suiteName.includes(searchTerm);
                
                testCase.style.display = matches || searchTerm === '' ? 'flex' : 'none';
                if (matches) hasMatchingTest = true;
            });
            
            suite.style.display = hasMatchingTest || searchTerm === '' ? 'block' : 'none';
        });
    });
}

function addReportTimestamp() {
    const header = document.querySelector('.header');
    if (header) {
        const timestamp = document.createElement('p');
        timestamp.textContent = `Generated on ${new Date().toLocaleString()}`;
        timestamp.style.opacity = '0.7';
        timestamp.style.fontSize = '0.9em';
        timestamp.style.marginTop = '10px';
        header.appendChild(timestamp);
    }
}

function addAutoRefresh() {
    // Add auto-refresh toggle button
    const header = document.querySelector('.header');
    if (header) {
        const autoRefreshContainer = document.createElement('div');
        autoRefreshContainer.style.marginTop = '15px';
        
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Auto-Refresh: OFF';
        refreshButton.style.padding = '8px 16px';
        refreshButton.style.backgroundColor = 'rgba(74, 158, 255, 0.2)';
        refreshButton.style.color = '#4a9eff';
        refreshButton.style.border = '1px solid #4a9eff';
        refreshButton.style.borderRadius = '4px';
        refreshButton.style.cursor = 'pointer';
        refreshButton.style.marginRight = '10px';
        
        let autoRefreshInterval;
        let isAutoRefreshOn = false;
        
        refreshButton.addEventListener('click', function() {
            if (isAutoRefreshOn) {
                clearInterval(autoRefreshInterval);
                this.textContent = 'Auto-Refresh: OFF';
                this.style.backgroundColor = 'rgba(74, 158, 255, 0.2)';
                isAutoRefreshOn = false;
            } else {
                autoRefreshInterval = setInterval(() => {
                    if (document.hidden) return; // Don't refresh if tab is not visible
                    location.reload();
                }, 5000); // Refresh every 5 seconds
                
                this.textContent = 'Auto-Refresh: ON';
                this.style.backgroundColor = 'rgba(72, 187, 120, 0.2)';
                this.style.color = '#48bb78';
                this.style.borderColor = '#48bb78';
                isAutoRefreshOn = true;
            }
        });
        
        const manualRefreshButton = document.createElement('button');
        manualRefreshButton.textContent = '🔄 Refresh Now';
        manualRefreshButton.style.padding = '8px 16px';
        manualRefreshButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        manualRefreshButton.style.color = '#e2e8f0';
        manualRefreshButton.style.border = '1px solid #4a5568';
        manualRefreshButton.style.borderRadius = '4px';
        manualRefreshButton.style.cursor = 'pointer';
        
        manualRefreshButton.addEventListener('click', () => location.reload());
        
        autoRefreshContainer.appendChild(refreshButton);
        autoRefreshContainer.appendChild(manualRefreshButton);
        header.appendChild(autoRefreshContainer);
    }
}

function addExportFeatures() {
    const header = document.querySelector('.header');
    if (header) {
        const exportContainer = document.createElement('div');
        exportContainer.style.marginTop = '10px';
        
        const exportButton = document.createElement('button');
        exportButton.textContent = '📊 Export Summary';
        exportButton.style.padding = '8px 16px';
        exportButton.style.backgroundColor = 'rgba(237, 137, 54, 0.2)';
        exportButton.style.color = '#ed8936';
        exportButton.style.border = '1px solid #ed8936';
        exportButton.style.borderRadius = '4px';
        exportButton.style.cursor = 'pointer';
        
        exportButton.addEventListener('click', function() {
            const summary = extractTestSummary();
            downloadJSON(summary, 'test-summary.json');
        });
        
        exportContainer.appendChild(exportButton);
        header.appendChild(exportContainer);
    }
}

function extractTestSummary() {
    const stats = {};
    
    // Extract basic stats
    document.querySelectorAll('.stat-card').forEach(card => {
        const label = card.querySelector('.stat-label')?.textContent;
        const value = card.querySelector('.stat-value')?.textContent;
        if (label && value) {
            stats[label.toLowerCase()] = value;
        }
    });
    
    // Extract coverage data
    const coverage = {};
    document.querySelectorAll('.coverage-item').forEach(item => {
        const label = item.querySelector('.coverage-label')?.textContent;
        const percentage = item.querySelector('.coverage-percentage')?.textContent;
        if (label && percentage) {
            coverage[label] = percentage;
        }
    });
    
    // Extract failed tests
    const failedTests = [];
    document.querySelectorAll('.test-case.failed').forEach(testCase => {
        const testName = testCase.querySelector('.test-name')?.textContent;
        if (testName) {
            failedTests.push(testName);
        }
    });
    
    return {
        timestamp: new Date().toISOString(),
        stats,
        coverage,
        failedTests,
        totalSuites: document.querySelectorAll('.test-suite').length
    };
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}