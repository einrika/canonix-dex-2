// ============================================
// AI.JS - AI Market Analysis
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { fetchDirect } from '../../core/utils.js';

export const AIModule = {
    generateAnalysis: async function() {
        const token = State.get('currentToken');
        if (!token) return;

        try {
            const analysis = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/ai-analysis?address=${token.address}`);
            return analysis;
        } catch (e) {
            console.error("AI Analysis failed", e);
            return { analysis: "Analysis currently unavailable." };
        }
    }
};
