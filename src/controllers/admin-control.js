const { sendResponse, getAdminState, updateAdminState, isValidPaxiAddress } = require('../utils/common');

const adminControlHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    let currentState = getAdminState();

    if (req.method === 'POST') {
        try {
            const { action: bodyAction, value } = req.body || {};

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
                        return sendResponse(res, false, null, 'Invalid address to block', 400);
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
            return sendResponse(res, false, null, 'Invalid request body', 400);
        }
    }

    return sendResponse(res, true, currentState);
};

module.exports = adminControlHandler;
