
import api from './axios'

export const getPendingSnapshots = async () => {
    const response = await api.get('/counsellor/pending-snapshots')
    return response.data
}

export const approveSnapshot = async (snapshotId) => {
    const response = await api.put(`/counsellor/snapshots/${snapshotId}/approve`)
    return response.data
}

export const rejectSnapshot = async (snapshotId, remarks) => {
    const response = await api.put(`/counsellor/snapshots/${snapshotId}/reject`, { remarks })
    return response.data
}
