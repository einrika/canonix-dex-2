// ========================================
// CONSOLE LOGGER SYSTEM
// ========================================

let consoleLogBuffer = [];
let consoleLogCount = { log: 0, warn: 0, error: 0, success: 0 };
let currentConsoleFilter = 'all';
let unreadConsoleCount = 0;

// Override console methods
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
};

// Intercept console.log
console.log = function(...args) {
    originalConsole.log.apply(console, args);
    addConsoleLog('log', args);
};

// Intercept console.warn
console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    addConsoleLog('warn', args);
};

// Intercept console.error
console.error = function(...args) {
    originalConsole.error.apply(console, args);
    addConsoleLog('error', args);
};

// Intercept console.info
console.info = function(...args) {
    originalConsole.info.apply(console, args);
    addConsoleLog('log', args);
};

// Custom success logger
window.logSuccess = function(...args) {
    originalConsole.log('✅', ...args);
    addConsoleLog('success', args);
};

// Catch uncaught errors
window.addEventListener('error', function(event) {
    addConsoleLog('error', [
        `Uncaught Error: ${event.message}`,
        `at ${event.filename}:${event.lineno}:${event.colno}`,
        event.error?.stack
    ]);
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    addConsoleLog('error', [
        `Unhandled Promise Rejection: ${event.reason}`,
        event.reason?.stack
    ]);
});

// Add log to buffer
function formatArg(arg) {
    if (arg instanceof Error) {
        return arg.stack || arg.message;
    } else if (typeof arg === 'object' && arg !== null) {
        try {
            return JSON.stringify(arg, null, 2);
        } catch (e) {
            return String(arg);
        }
    }
    return String(arg);
}

function addConsoleLog(type, args) {
    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });

    const message = args.map(formatArg).join(' ');

    const logEntry = {
        id: Date.now() + Math.random(),
        type,
        timestamp,
        message,
        fullTimestamp: new Date().toISOString()
    };

    consoleLogBuffer.push(logEntry);
    consoleLogCount[type]++;

    if (consoleLogBuffer.length > 500) consoleLogBuffer.shift();

    const modal = document.getElementById('consoleModal');
    if (modal && !modal.classList.contains('hidden')) {
        renderConsoleLog(logEntry);
        updateConsoleStats();
    } else {
        unreadConsoleCount++;
        updateConsoleBadge();
    }
}

// Render single log entry
function renderConsoleLog(entry) {
    const container = document.getElementById('consoleContent');

    // Remove "no logs" message
    if (container.querySelector('.text-gray-500')) {
        container.innerHTML = '';
    }

    const logItem = document.createElement('div');
    logItem.className = `console-log-item ${entry.type}`;
    logItem.setAttribute('data-type', entry.type);
    logItem.setAttribute('data-id', entry.id);

    const typeColors = {
        log: '#3b82f6',
        warn: '#f59e0b',
        error: '#ef4444',
        success: '#10b981'
    };

    const typeIcons = {
        log: 'info-circle',
        warn: 'exclamation-triangle',
        error: 'times-circle',
        success: 'check-circle'
    };

    logItem.innerHTML = `
        <div class="flex items-start gap-2">
            <span class="console-log-timestamp">${entry.timestamp}</span>
            <i class="fas fa-${typeIcons[entry.type]} mt-0.5" style="color: ${typeColors[entry.type]}"></i>
            <span class="console-log-type" style="color: ${typeColors[entry.type]}">${entry.type}</span>
            <pre class="console-log-message flex-1 whitespace-pre-wrap m-0">${escapeHtml(entry.message)}</pre>
        </div>
    `;

    // Apply current filter
    if (currentConsoleFilter !== 'all' && entry.type !== currentConsoleFilter) {
        logItem.classList.add('hidden');
    }

    container.appendChild(logItem);

    // Auto-scroll if enabled
    if (document.getElementById('autoScrollConsole')?.checked) {
        container.scrollTop = container.scrollHeight;
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle console modal
function toggleConsoleModal() {
    const modal = document.getElementById('consoleModal');
    const isHidden = modal.classList.contains('hidden');

    if (isHidden) {
        modal.classList.remove('hidden');
        renderAllConsoleLogs();
        updateConsoleStats();
        unreadConsoleCount = 0;
        updateConsoleBadge();
    } else {
        modal.classList.add('hidden');
    }
}

// Render all logs
function renderAllConsoleLogs() {
    const container = document.getElementById('consoleContent');
    container.innerHTML = '';

    if (consoleLogBuffer.length === 0) {
        container.innerHTML = `
            <div class="text-gray-500 text-center py-8">
                <i class="fas fa-terminal text-3xl mb-2"></i>
                <p>No logs yet. Start using the app...</p>
            </div>
        `;
        return;
    }

    consoleLogBuffer.forEach(entry => {
        renderConsoleLog(entry);
    });
}

// Filter logs
function filterConsoleLogs(filter) {
    currentConsoleFilter = filter;

    // Update button states
    document.querySelectorAll('.console-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });

    // Filter log items
    document.querySelectorAll('.console-log-item').forEach(item => {
        const type = item.getAttribute('data-type');
        if (filter === 'all' || type === filter) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Clear logs
function clearConsoleLogs() {
    if (confirm('Clear all console logs?')) {
        consoleLogBuffer = [];
        consoleLogCount = { log: 0, warn: 0, error: 0, success: 0 };
        document.getElementById('consoleContent').innerHTML = `
            <div class="text-gray-500 text-center py-8">
                <i class="fas fa-terminal text-3xl mb-2"></i>
                <p>Logs cleared. Start using the app...</p>
            </div>
        `;
        updateConsoleStats();
    }
}


// Download logs as JSON
// Copy all logs as JSON to clipboard
function downloadConsoleLogs() {
    const content = JSON.stringify(consoleLogBuffer, null, 2);

    navigator.clipboard.writeText(content).then(() => {
        showNotif('All console logs copied to clipboard!', 'success');
    }).catch(err => {
        showNotif('Failed to copy logs: ' + err, 'error');
    });
}


// Update stats
function updateConsoleStats() {
    const total = consoleLogCount.log + consoleLogCount.warn + consoleLogCount.error + consoleLogCount.success;

    window.setText('consoleCounter', `${total} logs`);
    window.setText('logCount', consoleLogCount.log);
    window.setText('warnCount', consoleLogCount.warn);
    window.setText('errorCount', consoleLogCount.error);

    const now = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    window.setText('consoleTimestamp', `Updated: ${now}`);
}

// Update badge
function updateConsoleBadge() {
    const badge = document.getElementById('consoleBadge');
    if (!badge) return;

    if (unreadConsoleCount > 0) {
        window.removeClass(badge, 'hidden');
        window.setText(badge, unreadConsoleCount > 99 ? '99+' : unreadConsoleCount);
    } else {
        window.addClass(badge, 'hidden');
    }
}

// Initialize on load
window.addEventListener('load', () => {
    console.log('🚀 Canonix Loaded');
    console.log('Console Logger Active');
    console.log('Build:', new Date().toISOString());
});