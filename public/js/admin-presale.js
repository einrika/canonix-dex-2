// Admin Presale Logic

const ADMIN_API = 'http://localhost:5000/api/admin';
let adminToken = localStorage.getItem('adminToken');

async function adminLogin(username, password) {
    try {
        const response = await fetch(`${ADMIN_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            location.reload();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

async function fetchAllTransactions() {
    if (!adminToken) return;
    try {
        const response = await fetch(`${ADMIN_API}/transactions`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        if (data.success) {
            renderTransactions(data.data);
        }
    } catch (error) {
        console.error('Fetch transactions error:', error);
    }
}

function renderTransactions(txs) {
    const container = document.getElementById('adminTxContainer');
    if (!container) return;

    container.innerHTML = txs.map(tx => `
        <tr class="border-b border-black/20 text-xs font-mono">
            <td class="p-4">${tx.id}</td>
            <td class="p-4">${tx.user_address.substring(0, 10)}...</td>
            <td class="p-4">${tx.symbol}</td>
            <td class="p-4">${tx.amount_paxi / 1e6} PAXI</td>
            <td class="p-4">${tx.status}</td>
            <td class="p-4">
                ${tx.status === 'verified' ? `
                    <button onclick="manualApprove(${tx.id})" class="bg-meme-green text-black px-2 py-1 uppercase font-bold">Approve</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

async function manualApprove(id) {
    if (!confirm('Are you sure you want to manually approve and distribute?')) return;
    try {
        const response = await fetch(`${ADMIN_API}/manual-approve/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        if (data.success) {
            alert('Distribution successful: ' + data.txHash);
            fetchAllTransactions();
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Manual approve error:', error);
    }
}

async function createToken(tokenData) {
    try {
        const response = await fetch(`${ADMIN_API}/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(tokenData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Token created successfully!');
            location.reload();
        } else {
            alert('Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Create token error:', error);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (!adminToken) {
        document.getElementById('loginView').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    } else {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        fetchAllTransactions();
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            adminLogin(e.target.username.value, e.target.password.value);
        };
    }

    const tokenForm = document.getElementById('tokenForm');
    if (tokenForm) {
        tokenForm.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(tokenForm);
            const tokenData = Object.fromEntries(formData.entries());
            createToken(tokenData);
        };
    }
});
