// ========================================
// CONSOLE LOGGER SYSTEM
// ========================================

export const ConsoleSystem = {
    buffer: [],
    counts: { log: 0, warn: 0, error: 0, success: 0 },
    unreadCount: 0,

    init: function() {
        const originalConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info };

        console.log = (...args) => { originalConsole.log.apply(console, args); this.addLog('log', args); };
        console.warn = (...args) => { originalConsole.warn.apply(console, args); this.addLog('warn', args); };
        console.error = (...args) => { originalConsole.error.apply(console, args); this.addLog('error', args); };
        console.info = (...args) => { originalConsole.info.apply(console, args); this.addLog('log', args); };

        window.addEventListener('error', (event) => {
            this.addLog('error', [`Uncaught Error: ${event.message}`, `at ${event.filename}:${event.lineno}`, event.error?.stack]);
        });
    },

    addLog: function(type, args) {
        const entry = {
            id: Date.now(),
            type,
            timestamp: new Date().toLocaleTimeString(),
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
        };
        this.buffer.push(entry);
        this.counts[type]++;
        if (this.buffer.length > 500) this.buffer.shift();

        window.dispatchEvent(new CustomEvent('paxi_console_log', { detail: entry }));
    }
};
