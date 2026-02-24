export const ConsoleModalUI = (props) => {
    return `
        <div id="consoleModal" class="hidden fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4">
            <div class="bg-black border-4 border-meme-green shadow-[0_0_30px_rgba(0,214,133,0.2)] w-full max-w-4xl h-[80vh] overflow-hidden flex flex-col font-mono">
                <div class="p-3 border-b-2 border-meme-green flex justify-between items-center bg-meme-green/10">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full bg-meme-green animate-pulse"></div>
                        <span class="text-meme-green text-xs font-bold uppercase tracking-widest">SYSTEM CONSOLE V1.0.4</span>
                    </div>
                    <button id="closeConsole" class="text-meme-green hover:scale-125 transition-transform"><i class="fas fa-times text-lg"></i></button>
                </div>
                <div id="consoleOutput" class="flex-1 overflow-y-auto p-4 text-meme-green text-xs space-y-1 no-scrollbar selection:bg-meme-green selection:text-black"></div>
                <div class="p-3 border-t-2 border-meme-green bg-meme-green/5 flex gap-3">
                    <span class="text-meme-green font-bold">$</span>
                    <input type="text" id="consoleInput" class="flex-1 bg-transparent border-none outline-none text-meme-green text-xs font-bold placeholder:text-meme-green/30" placeholder="ENTER COMMAND..." autocomplete="off">
                </div>
            </div>
        </div>
    `;
};
