// ============================================
// CONSOLEMODAL COMPONENT (ES Module)
// ============================================

export const ConsoleModal = {
    render: () => {
        return `
            <div id="consoleModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9000] hidden items-center justify-center p-4">
                <div class="bg-black border-4 border-meme-green w-full max-w-4xl shadow-[0_0_50px_rgba(0,255,159,0.2)] p-6 animate-slide-up relative font-mono text-[10px]">
                    <div class="flex items-center justify-between border-b-2 border-meme-green/30 pb-3 mb-4">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-terminal text-meme-green"></i>
                            <span class="text-meme-green uppercase font-black tracking-widest">System Console v1.0.4</span>
                        </div>
                        <button id="closeConsole" class="text-meme-green hover:text-white transition-colors">
                            <i class="fas fa-times text-lg"></i>
                        </button>
                    </div>

                    <div id="consoleLogs" class="h-[400px] overflow-y-auto space-y-1 mb-4 scrollbar-thin scrollbar-thumb-meme-green/20">
                        <div class="text-meme-green/50"> [${new Date().toLocaleTimeString()}] System initializing...</div>
                        <div class="text-meme-green/50"> [${new Date().toLocaleTimeString()}] Establishing peer connections...</div>
                        <div class="text-meme-green"> [${new Date().toLocaleTimeString()}] Secure link established. Welcome, Operative.</div>
                    </div>

                    <div class="relative">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 text-meme-green">></div>
                        <input id="consoleInput" type="text" class="w-full bg-transparent border-none outline-none text-meme-green pl-6" placeholder="ENTER COMMAND..." autofocus>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeConsole')?.addEventListener('click', () => {
            container.querySelector('#consoleModal').classList.add('hidden');
        });

        const input = container.querySelector('#consoleInput');
        const logs = container.querySelector('#consoleLogs');

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim().toUpperCase();
                if (!cmd) return;

                const entry = document.createElement('div');
                entry.className = 'text-meme-cyan';
                entry.textContent = ` [${new Date().toLocaleTimeString()}] COMMAND: ${cmd}`;
                logs?.appendChild(entry);

                const response = document.createElement('div');
                response.className = 'text-meme-green';
                response.textContent = ` [${new Date().toLocaleTimeString()}] OUTPUT: Execute permission denied for level 0 user.`;
                logs?.appendChild(response);

                input.value = '';
                logs.scrollTop = logs.scrollHeight;
            }
        });
    }
};
