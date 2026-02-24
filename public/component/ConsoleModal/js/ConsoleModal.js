window.UIManager.registerUI('ConsoleModal', () => {
    return `
        <div id="consoleModal" class="hidden fixed inset-0 bg-primary/98 z-[9999] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-3xl h-[60vh] flex flex-col overflow-hidden shadow-minimal">
                <div class="p-2.5 border-b border-secondary flex justify-between items-center bg-secondary">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-terminal text-soft-success text-base"></i>
                        <span class="font-display text-base text-primary-text uppercase">SYSTEM CONSOLE</span>
                    </div>
                    <button id="close-console-modal" class="text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div id="consoleContent" class="flex-1 overflow-y-auto p-3 font-mono text-[7px] text-soft-success bg-primary no-scrollbar selection:bg-soft-success selection:text-black"></div>
                <div class="p-2 border-t border-secondary bg-secondary flex justify-between items-center">
                    <span id="consoleStats" class="font-mono text-[7px] text-muted-text font-bold uppercase tracking-widest">0 LOGS</span>
                    <button id="purge-console" class="font-display text-sm text-soft-failed hover:text-primary-text transition-colors uppercase border-b border-soft-failed leading-none">PURGE</button>
                </div>
            </div>
        </div>
    `;
});

// ============================================
// CONSOLEMODAL LOGIC
// ============================================

let consoleLogBuffer = [];
let consoleLogCount = { log: 0, warn: 0, error: 0, success: 0 };
let currentConsoleFilter = 'all';
let unreadConsoleCount = 0;

const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
};

console.log = function(...args) {
    originalConsole.log.apply(console, args);
    addConsoleLog('log', args);
};
console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    addConsoleLog('warn', args);
};
console.error = function(...args) {
    originalConsole.error.apply(console, args);
    addConsoleLog('error', args);
};
console.info = function(...args) {
    originalConsole.info.apply(console, args);
    addConsoleLog('log', args);
};

window.logSuccess = function(...args) {
    originalConsole.log('✅', ...args);
    addConsoleLog('success', args);
};

window.addEventListener('error', function(event) {
    addConsoleLog('error', [`Uncaught Error: ${event.message}`, `at ${event.filename}:${event.lineno}:${event.colno}`, event.error?.stack]);
});

window.addEventListener('unhandledrejection', function(event) {
    addConsoleLog('error', [`Unhandled Promise Rejection: ${event.reason}`, event.reason?.stack]);
});

function formatArg(arg) {
    if (arg instanceof Error) return arg.stack || arg.message;
    else if (typeof arg === 'object' && arg !== null) {
        try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); }
    }
    return String(arg);
}

function addConsoleLog(type, args) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    const message = args.map(formatArg).join(' ');
    const logEntry = { id: Date.now() + Math.random(), type, timestamp, message, fullTimestamp: new Date().toISOString() };
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

function renderConsoleLog(entry) {
    const container = document.getElementById('consoleContent');
    if (!container) return;
    if (container.querySelector('.text-muted-text')) container.innerHTML = '';

    const logItem = document.createElement('div');
    logItem.className = `console-log-item p-4 border-b border-white/5 font-mono text-[10px] leading-relaxed group hover:bg-white/5 transition-colors`;
    logItem.setAttribute('data-type', entry.type);
    logItem.setAttribute('data-id', entry.id);

    const typeColors = { log: 'text-meme-cyan', warn: 'text-meme-yellow', error: 'text-meme-pink', success: 'text-meme-green' };
    const typeIcons = { log: 'info-circle', warn: 'exclamation-triangle', error: 'times-circle', success: 'check-circle' };

    logItem.innerHTML = `
        <div class="flex items-start gap-4">
            <span class="text-muted-text font-bold uppercase shrink-0">${entry.timestamp}</span>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <i class="fas fa-${typeIcons[entry.type]} ${typeColors[entry.type]}"></i>
                    <span class="${typeColors[entry.type]} font-black uppercase italic">${entry.type}</span>
                </div>
                <pre class="text-secondary-text whitespace-pre-wrap break-words overflow-hidden selection:bg-meme-green selection:text-black">${_local_escapeHtml(entry.message)}</pre>
            </div>
        </div>
    `;

    if (currentConsoleFilter !== 'all' && entry.type !== currentConsoleFilter) logItem.classList.add('hidden');
    container.appendChild(logItem);
    container.scrollTop = container.scrollHeight;
}

function _local_escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.toggleConsole = function() {
    const modal = document.getElementById('consoleModal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        renderAllConsoleLogs();
        updateConsoleStats();
        unreadConsoleCount = 0;
        updateConsoleBadge();
    } else modal.classList.add('hidden');
};

// Legacy support
window.toggleConsoleModal = window.toggleConsole;

function renderAllConsoleLogs() {
    const container = document.getElementById('consoleContent');
    if (!container) return;
    container.innerHTML = '';
    if (consoleLogBuffer.length === 0) {
        container.innerHTML = `<div class="text-muted-text text-center py-20 font-display text-2xl uppercase italic opacity-20"><i class="fas fa-terminal text-6xl mb-6"></i><p>Zero Activity Logs</p></div>`;
        return;
    }
    consoleLogBuffer.forEach(entry => renderConsoleLog(entry));
}

window.clearConsoleLogs = function() {
    if (confirm('PURGE ALL SYSTEM LOGS?')) {
        consoleLogBuffer = [];
        consoleLogCount = { log: 0, warn: 0, error: 0, success: 0 };
        const content = document.getElementById('consoleContent');
        if (content) content.innerHTML = `<div class="text-muted-text text-center py-20 font-display text-2xl uppercase italic opacity-20"><i class="fas fa-terminal text-6xl mb-6"></i><p>Logs Purged</p></div>`;
        updateConsoleStats();
    }
};

function updateConsoleStats() {
    const total = consoleLogCount.log + consoleLogCount.warn + consoleLogCount.error + consoleLogCount.success;
    const statsEl = document.getElementById('consoleStats');
    if (statsEl) statsEl.textContent = `${total} OPERATIONS LOGGED`;
}

function updateConsoleBadge() {
    const badge = document.getElementById('consoleBadge');
    if (!badge) return;
    if (unreadConsoleCount > 0) {
        badge.classList.remove('hidden');
        badge.textContent = unreadConsoleCount > 99 ? '99+' : unreadConsoleCount;
    } else badge.classList.add('hidden');
}

window.UIManager.registerLogic('ConsoleModal', (container) => {
    container.querySelector('#close-console-modal')?.addEventListener('click', () => window.toggleConsole());
    container.querySelector('#purge-console')?.addEventListener('click', () => window.clearConsoleLogs());

    renderAllConsoleLogs();
    updateConsoleStats();
    updateConsoleBadge();
});

originalConsole.log('🚀 SYSTEM UPLINK ESTABLISHED');
originalConsole.log('CONSCIOUSNESS ACTIVE');
