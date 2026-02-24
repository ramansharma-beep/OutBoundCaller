document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) {
        return;
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.logout();
    });
    
    loadCallLogs();
});

async function loadCallLogs() {
    const container = document.getElementById('callLogsContainer');
    container.innerHTML = '<div class="loading">Loading call logs...</div>';
    
    try {

        const response = await fetch('/api/call-logs', {
            headers: auth.getAuthHeaders()
        });
        
        if (response.status === 401) {
            auth.logout();
            return;
        }
        
        const data = await response.json();
         
        if (!response.ok) {
            throw new Error(data.error || 'Failed to load call logs');
        }
        // console.log('Call logs received:', data.logs); // Debug log

        renderCallLogsTable(data.logs || []); 

        
    } catch (error) {
        console.error('Error loading call logs:', error);
        container.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function renderCallLogsTable(logs) {
    const container = document.getElementById('callLogsContainer');
    if (!logs || logs.length === 0) {
        container.innerHTML = '<p class="empty-state">No call logs found.</p>';
        return;
    }
    console.log('rendering call logs table with logs: ',logs);

    container.innerHTML = `
        <table class="call-logs-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${logs.map(log => {

                    const statusClass = (log.status || 'unknown').toLowerCase();
                    return `
                    <tr>
                        <td>${formatDate(log.created_at)}</td>
                        <td>${log.from_number || 'N/A'}</td>
                        <td>${log.to_number || 'N/A'}</td>
                        <td>${formatDuration(log.duration || 0)}</td>
                        <td><span class="status-badge status-${statusClass}">${(log.status || 'unknown').toUpperCase()}</span></td>
                        <td>
                            <button class="btn-delete" onclick="deleteCallLog('${log.call_sid}')">Delete</button>
                        </td>
                    </tr>
                `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function deleteCallLog(call_sid) {
    if (!confirm('Are you sure you want to delete this call log?')) {
        return;
    }
    // console.log("deleting call log with call_sid ---- ",call_sid);
    try {
        const response = await fetch(`/api/delete-call-log/${call_sid}`,{
            method: 'DELETE',
            headers: auth.getAuthHeaders()
        });
        
        if (response.status === 401) {
            auth.logout();
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete call log');
        }
        
        loadCallLogs();
        
    } catch (error) {

        alert(error.message);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
