// ============================================
// AI MODAL LOGIC
// ============================================

import { AIModule } from '../modules/market/ai.js';

export const AIModalLogic = (container) => {
    const modal = container.querySelector('#aiModal');
    const content = container.querySelector('#ai-analysis-content');

    window.addEventListener('paxi_show_ai_modal', async () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');

        if (content) {
            content.innerHTML = '<div class="py-20 text-center"><i class="fas fa-brain fa-spin text-4xl text-meme-cyan"></i></div>';
            const analysis = await AIModule.generateAnalysis();
            content.innerHTML = `<div class="p-6 text-gray-300 font-mono italic">"${analysis.analysis}"</div>`;
        }
    });

    container.querySelector('#closeAiModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });
};
