// ============================================
// TOKENMODAL COMPONENT (ES Module)
// ============================================

export const TokenModal = {
    render: () => {
        return `
            <div id="tokenModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[900] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-2xl shadow-brutal p-6 md:p-10 animate-slide-up relative overflow-y-auto max-h-[90vh]">
                    <button id="closeTokenModal" class="absolute top-6 right-6 text-muted-text hover:text-primary-text transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>

                    <div id="tokenModalContent">
                        <!-- Content injected dynamically -->
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeTokenModal')?.addEventListener('click', () => {
            container.querySelector('#tokenModal').classList.add('hidden');
            container.querySelector('#tokenModal').classList.remove('flex');
        });
    }
};
