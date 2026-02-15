const { sendResponse, getAdminState, updateAdminState, isValidPaxiAddress } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    let currentState = getAdminState();

    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            const { action: bodyAction, value } = body;

            switch (bodyAction) {
                case 'freeze':
                    currentState = updateAdminState({ isFrozen: !!value });
                    break;
                case 'block':
                    if (value && isValidPaxiAddress(value)) {
                        const blocked = new Set(currentState.blockedAddresses);
                        blocked.add(value);
                        currentState = updateAdminState({ blockedAddresses: Array.from(blocked) });
                    } else if (value) {
                        return sendResponse(false, null, 'Invalid address to block', 400);
                    }
                    break;
                case 'unblock':
                    if (value && isValidPaxiAddress(value)) {
                        const blocked = currentState.blockedAddresses.filter(a => a !== value);
                        currentState = updateAdminState({ blockedAddresses: blocked });
                    }
                    break;
            }
        } catch (e) {
            return sendResponse(false, null, 'Invalid request body', 400);
        }
    }

    return sendResponse(true, currentState);
};
