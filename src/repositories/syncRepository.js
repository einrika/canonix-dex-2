const supabase = require('../utils/supabase');
const { secureLogger } = require('../utils/common');

class SyncRepository {
    async startSync(syncType) {
        const { data, error } = await supabase
            .from('sync_logs')
            .insert({
                sync_type: syncType,
                status: 'running',
                started_at: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error starting sync log:', error);
            throw error;
        }
        return data[0];
    }

    async finishSync(id, status, message = null) {
        const now = new Date();

        // Fetch started_at to calculate duration
        const { data: syncLog } = await supabase
            .from('sync_logs')
            .select('started_at')
            .eq('id', id)
            .single();

        let durationMs = null;
        if (syncLog) {
            durationMs = now.getTime() - new Date(syncLog.started_at).getTime();
        }

        const { data, error } = await supabase
            .from('sync_logs')
            .update({
                status,
                message,
                finished_at: now.toISOString(),
                duration_ms: durationMs
            })
            .eq('id', id)
            .select();

        if (error) {
            secureLogger.error('Error finishing sync log:', error);
            throw error;
        }
        return data[0];
    }
}

module.exports = new SyncRepository();
