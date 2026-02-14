
import { useState, useEffect } from 'react'
import { getPendingSnapshots, approveSnapshot, rejectSnapshot } from '../../api/review'
import Loader from '../common/Loader'

const PendingSnapshots = () => {
    const [snapshots, setSnapshots] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [processingId, setProcessingId] = useState(null)

    // Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [selectedSnapshotId, setSelectedSnapshotId] = useState(null)
    const [rejectRemarks, setRejectRemarks] = useState('')

    useEffect(() => {
        fetchSnapshots()
    }, [])

    const fetchSnapshots = async () => {
        setLoading(true)
        try {
            const res = await getPendingSnapshots()
            if (res.success) {
                setSnapshots(res.data)
                setError(null)
            } else {
                setError(res.error || "Failed to fetch pending snapshots")
            }
        } catch (err) {
            console.error(err)
            setError("Error loading pending snapshots")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        if (!confirm("Are you sure you want to approve this snapshot?")) return

        setProcessingId(id)
        try {
            const res = await approveSnapshot(id)
            if (res.success) {
                // Remove from list
                setSnapshots(prev => prev.filter(s => s.snapshot_id !== id))
                // Could show toast success here
            } else {
                alert(res.error || "Failed to approve")
            }
        } catch (err) {
            console.error(err)
            alert("Error approving snapshot")
        } finally {
            setProcessingId(null)
        }
    }

    const openRejectModal = (id) => {
        setSelectedSnapshotId(id)
        setRejectRemarks('')
        setIsRejectModalOpen(true)
    }

    const handleRejectConfirm = async () => {
        if (!selectedSnapshotId) return

        setProcessingId(selectedSnapshotId)
        try {
            const res = await rejectSnapshot(selectedSnapshotId, rejectRemarks || "Rejected by counsellor")
            if (res.success) {
                setSnapshots(prev => prev.filter(s => s.snapshot_id !== selectedSnapshotId))
                closeRejectModal()
            } else {
                alert(res.error || "Failed to reject")
            }
        } catch (err) {
            console.error(err)
            alert("Error rejecting snapshot")
        } finally {
            setProcessingId(null)
        }
    }

    const closeRejectModal = () => {
        setIsRejectModalOpen(false)
        setSelectedSnapshotId(null)
        setRejectRemarks('')
    }

    if (loading) return <div className="flex justify-center p-8"><Loader /></div>

    if (error) return <div className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100 bg-amber-50 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-amber-900">Pending Snapshot Approvals</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded border border-amber-200">{snapshots.length} Pending</span>
            </div>

            {snapshots.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No pending snapshots to review. All caught up!</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Solved</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Snapshot Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {snapshots.map((snap) => (
                                <tr key={snap.snapshot_id} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{snap.student_name}</div>
                                        <div className="text-xs text-gray-500">{snap.register_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{snap.platform_name}</div>
                                        <div className="text-xs text-gray-500">@{snap.username}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                                        {snap.total_solved}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {snap.contest_rating || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        {new Date(snap.snapshot_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleApprove(snap.snapshot_id)}
                                            disabled={processingId === snap.snapshot_id}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                        >
                                            {processingId === snap.snapshot_id ? 'Wait...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(snap.snapshot_id)}
                                            disabled={processingId === snap.snapshot_id}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeRejectModal} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Reject Snapshot</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-4">
                                                Please provide a reason for rejecting this snapshot. The student will see this remark.
                                            </p>
                                            <textarea
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                                rows="3"
                                                placeholder="Enter rejection remarks..."
                                                value={rejectRemarks}
                                                onChange={(e) => setRejectRemarks(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    onClick={handleRejectConfirm}
                                    disabled={!rejectRemarks.trim() || processingId !== null}
                                >
                                    {processingId ? 'Rejecting...' : 'Confirm Reject'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={closeRejectModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PendingSnapshots
