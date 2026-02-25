// ============================================
// TOKEN-CNX.JS - Dynamic Rendering Logic
// ============================================

(function() {
    // Utility function for scroll reveal
    const initScrollReveal = () => {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-[20px]');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('opacity-0', 'translate-y-[20px]', 'transition-all', 'duration-[800ms]', 'ease-[cubic-bezier(0.4,0,0.2,1)]');
            observer.observe(el);
        });
    };

    // Render logic
    const renderPage = () => {
        const config = window.TOKEN_PAGE_CONFIG;
        if (!config) {
            console.error("Token page configuration not found!");
            return;
        }

        // 1. Render Header Section
        const headerContainer = document.getElementById('cnx-header');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div class="reveal">
                    <div class="flex items-center gap-6 mb-8">
                        <div class="w-16 h-16 md:w-24 md:h-24 border-4 border-card shadow-brutal-lg rotate-[-5deg] overflow-hidden bg-meme-surface flex items-center justify-center">
                            <img src="${config.token.logo}" alt="${config.token.name} Logo" class="w-full h-full object-contain">
                        </div>
                        <div>
                            <h1 class="text-4xl md:text-7xl font-display leading-[0.8] tracking-tighter italic uppercase text-primary-text drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                                ${config.token.name} <span class="text-meme-green">(${config.token.symbol})</span>
                            </h1>
                            <p class="font-display text-xl md:text-3xl text-meme-cyan italic uppercase tracking-tighter mt-2 drop-shadow-[2px_2px_0_rgba(11,12,13,1)]">
                                ${config.token.tagline}
                            </p>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-3 gap-8 items-start">
                        <div class="md:col-span-2 space-y-4">
                            ${config.description.map(p => `<p class="font-mono text-secondary-text text-sm md:text-base leading-relaxed font-bold uppercase italic">${p}</p>`).join('')}
                        </div>
                        <div class="space-y-6">
                            <a href="${config.token.ctaLink}" class="block bg-meme-green text-black font-display text-3xl px-8 py-5 border-4 border-card shadow-brutal-green hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic text-center">
                                SWAP ${config.token.symbol}
                            </a>
                            <div class="p-6 bg-meme-surface border-4 border-card shadow-brutal-cyan rotate-1">
                                <h4 class="font-display text-xl text-meme-cyan mb-4 italic uppercase">Quick Links</h4>
                                <div class="flex flex-col gap-3">
                                    <button onclick="navigator.clipboard.writeText('${config.token.contractAddress}')" class="flex items-center gap-3 font-mono text-[10px] text-muted-text hover:text-primary-text transition-colors uppercase font-black tracking-widest text-left">
                                        <i class="fas fa-copy text-sm"></i> Copy Address
                                    </button>
                                    <a href="trade.html" class="flex items-center gap-3 font-mono text-[10px] text-muted-text hover:text-primary-text transition-colors uppercase font-black tracking-widest">
                                        <i class="fas fa-exchange-alt text-sm"></i> Trade Terminal
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. Render Token Information
        const infoContainer = document.getElementById('cnx-info');
        if (infoContainer) {
            const infoItems = [
                { label: "Name", value: config.token.name },
                { label: "Symbol", value: config.token.symbol },
                { label: "Standard", value: config.token.standard },
                { label: "Total Supply", value: config.token.totalSupply },
                { label: "Network", value: config.token.network }
            ];

            infoContainer.innerHTML = `
                <div class="reveal max-w-4xl mx-auto">
                    <h2 class="text-4xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-10 text-center drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                        Token <span class="text-meme-yellow">Information</span>
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${infoItems.map(item => `
                            <div class="bg-meme-surface border-2 border-card p-4 shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex justify-between items-center">
                                <span class="font-mono text-[10px] text-muted-text uppercase font-black tracking-widest italic">${item.label}</span>
                                <span class="font-display text-xl text-primary-text italic uppercase">${item.value}</span>
                            </div>
                        `).join('')}
                        <div class="bg-meme-surface border-2 border-card p-4 shadow-brutal md:col-span-2 group cursor-pointer" onclick="navigator.clipboard.writeText('${config.token.contractAddress}')">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-mono text-[10px] text-muted-text uppercase font-black tracking-widest italic">Contract Address</span>
                                <i class="fas fa-copy text-meme-green opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                            <code class="font-mono text-xs md:text-sm text-meme-green break-all">${config.token.contractAddress}</code>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Render Token Utility
        const utilityContainer = document.getElementById('cnx-utility');
        if (utilityContainer) {
            utilityContainer.innerHTML = `
                <div class="reveal">
                    <h2 class="text-4xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-12 text-center drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                        Ecosystem <span class="text-meme-cyan">Utilities</span>
                    </h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${config.utilities.map((u, i) => `
                            <div class="p-6 bg-meme-surface border-4 border-card shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all delay-[${i * 100}ms]">
                                <div class="w-14 h-14 bg-bg border-2 border-card flex items-center justify-center text-meme-cyan text-2xl mb-6 shadow-brutal-sm rotate-[-10deg] group-hover:rotate-0 transition-transform">
                                    <i class="${u.icon}"></i>
                                </div>
                                <h4 class="text-2xl md:text-3xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">${u.title}</h4>
                                <p class="font-mono text-secondary-text text-[11px] font-bold uppercase tracking-wide leading-relaxed italic">${u.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 4. Render Tokenomics
        const tokenomicsContainer = document.getElementById('cnx-tokenomics');
        if (tokenomicsContainer) {
            tokenomicsContainer.innerHTML = `
                <div class="reveal max-w-4xl mx-auto">
                    <h2 class="text-4xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-12 text-center drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                        CNX <span class="text-meme-pink">Tokenomics</span>
                    </h2>
                    <div class="bg-meme-surface border-4 border-card p-8 shadow-brutal-lg">
                        <div class="space-y-8">
                            ${config.tokenomics.map((t, i) => `
                                <div class="space-y-2">
                                    <div class="flex justify-between items-end">
                                        <span class="font-display text-2xl text-primary-text italic uppercase tracking-tighter">${t.label}</span>
                                        <span class="font-mono text-xl text-primary-text font-black">${t.percentage}%</span>
                                    </div>
                                    <div class="h-6 bg-bg border-2 border-card shadow-inner overflow-hidden">
                                        <div class="${t.color} h-full transition-all duration-[1.5s] ease-out w-0 progress-bar shadow-[inset_-4px_0_0_rgba(0,0,0,0.1)]" data-target="${t.percentage}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div class="font-display text-3xl text-meme-green italic tracking-tighter">100%</div>
                                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest italic">Distributed</div>
                            </div>
                            <div>
                                <div class="font-display text-3xl text-meme-cyan italic tracking-tighter">PRC20</div>
                                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest italic">Standard</div>
                            </div>
                            <div>
                                <div class="font-display text-3xl text-meme-yellow italic tracking-tighter">LOCKED</div>
                                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest italic">Liquidity</div>
                            </div>
                            <div>
                                <div class="font-display text-3xl text-meme-pink italic tracking-tighter">PAXI</div>
                                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest italic">Network</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Animate progress bars on scroll
            const progressBarObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const bars = entry.target.querySelectorAll('.progress-bar');
                        bars.forEach(bar => {
                            bar.style.width = bar.dataset.target;
                        });
                    }
                });
            }, { threshold: 0.5 });
            progressBarObserver.observe(tokenomicsContainer);
        }

        // 5. Render Roadmap
        const roadmapContainer = document.getElementById('cnx-roadmap');
        if (roadmapContainer) {
            roadmapContainer.innerHTML = `
                <div class="reveal max-w-5xl mx-auto">
                    <h2 class="text-4xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-16 text-center drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                        Technical <span class="text-meme-green">Roadmap</span>
                    </h2>
                    <div class="relative space-y-12">
                        <!-- Vertical Line -->
                        <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-card -translate-x-1/2 hidden md:block"></div>

                        ${config.roadmap.map((phase, i) => {
                            const isEven = i % 2 === 0;
                            const statusColor = phase.status === 'completed' ? 'text-meme-green' : (phase.status === 'current' ? 'text-meme-yellow animate-pulse' : 'text-muted-text');
                            const bgColor = phase.status === 'completed' ? 'bg-meme-green/10' : (phase.status === 'current' ? 'bg-meme-yellow/10' : 'bg-meme-surface');
                            const shadowColor = phase.status === 'completed' ? 'shadow-brutal-green' : (phase.status === 'current' ? 'shadow-brutal-yellow' : 'shadow-brutal');

                            return `
                                <div class="relative flex flex-col md:flex-row items-center justify-between group">
                                    <div class="order-2 md:order-1 w-full md:w-[45%] ${isEven ? 'md:text-right' : 'md:order-3 md:text-left'}">
                                        <div class="${bgColor} border-4 border-card p-6 ${shadowColor} hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                            <div class="font-mono text-[10px] ${statusColor} font-black uppercase tracking-widest italic mb-2">${phase.status}</div>
                                            <h3 class="text-2xl md:text-4xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">${phase.phase}</h3>
                                            <ul class="space-y-2">
                                                ${phase.items.map(item => `
                                                    <li class="font-mono text-[11px] text-secondary-text font-bold uppercase tracking-wide italic flex items-center gap-3 ${isEven ? 'md:flex-row-reverse' : ''}">
                                                        <i class="fas fa-caret-${isEven ? 'left md:rotate-180' : 'right'} ${statusColor}"></i>
                                                        ${item}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    </div>

                                    <!-- Center Point -->
                                    <div class="absolute left-4 md:left-1/2 w-8 h-8 bg-bg border-4 border-card rounded-none -translate-x-1/2 z-10 md:block hidden ${phase.status === 'current' ? 'border-meme-yellow shadow-[0_0_15px_#D6B500]' : ''}"></div>

                                    <div class="md:order-2 w-full md:w-[45%] h-8 md:h-auto"></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // 6. Render FAQ
        const faqContainer = document.getElementById('cnx-faq');
        if (faqContainer) {
            faqContainer.innerHTML = `
                <div class="reveal max-w-3xl mx-auto">
                    <h2 class="text-4xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-12 text-center drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                        Common <span class="text-meme-yellow">Questions</span>
                    </h2>
                    <div class="space-y-4">
                        ${config.faq.map((f, i) => `
                            <div class="bg-meme-surface border-2 border-card shadow-brutal overflow-hidden">
                                <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" class="w-full p-6 flex justify-between items-center text-left group">
                                    <span class="font-display text-xl md:text-2xl text-primary-text italic uppercase tracking-tighter group-hover:text-meme-green transition-colors">${f.question}</span>
                                    <i class="fas fa-chevron-down text-muted-text transition-transform duration-300"></i>
                                </button>
                                <div class="hidden px-6 pb-6 pt-2 border-t border-card bg-bg/50">
                                    <p class="font-mono text-secondary-text text-xs md:text-sm leading-relaxed font-bold uppercase italic">${f.answer}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        initScrollReveal();
    };

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPage);
    } else {
        renderPage();
    }
})();
