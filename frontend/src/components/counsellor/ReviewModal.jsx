
import { useState } from 'react'
import { approveSnapshot, rejectSnapshot } from '../../api/review'

const ReviewModal = ({ isOpen, onClose, snapshot, onActionComplete }) => {
    const [remarks, setRemarks] = useState('')
    const [processing, setProcessing] = useState(false)

    if (!isOpen || !snapshot) return null

    const handleApprove = async () => {
        if (!confirm("Confirm approval?")) return
        setProcessing(true)
        try {
            const res = await approveSnapshot(snapshot.snapshot_id)
            if (res.success) {
                onActionComplete("Approved successfully")
                onClose()
            } else {
                alert(res.error)
            }
        } catch (err) {
            console.error(err)
            alert("Error approving snapshot")
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!remarks.trim()) {
            alert("Please provide remarks for rejection.")
            return
        }
        if (!confirm("Confirm rejection?")) return

        setProcessing(true)
        try {
            const res = await rejectSnapshot(snapshot.snapshot_id, remarks)
            if (res.success) {
                onActionComplete("Rejected successfully")
                onClose()
            } else {
                alert(res.error)
            }
        } catch (err) {
            console.error(err)
            alert("Error rejecting snapshot")
        } finally {
            setProcessing(false)
        }
    }

    // Growth Calculation/Display
    // Snapshot doesn't seem to pass "Previous" snapshot data for comparison in the single object from pending list.
    // We might need to rely on what's available or fetching it. 
    // The endpoint `pending-snapshots` returns: total_solved, contest_rating, date.
    // It does NOT return previous snapshot data.
    // I can't calculate growth comparison without it.
    // I will display "N/A" or hide growth comparison if data is missing, to be safe.

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4" id="modal-title">
                                    Review Snapshot
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Student Name</label>
                                            <div className="text-sm font-semibold text-gray-900">{snapshot.student_name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Register Number</label>
                                            <div className="text-sm text-gray-900">{snapshot.register_number}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Platform</label>
                                            <div className="text-sm text-gray-900">{snapshot.platform_name} (@{snapshot.username})</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Snapshot Date</label>
                                            <div className="text-sm text-gray-900">{new Date(snapshot.snapshot_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div>
                                                <div className="text-xs text-gray-500">Total Solved</div>
                                                <div className="text-xl font-bold text-indigo-600">{snapshot.total_solved}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500">Rating</div>
                                                <div className="text-xl font-bold text-gray-700">{snapshot.contest_rating || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Counsellor Remarks</label>
                                        <textarea
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                            rows="3"
                                            placeholder="Enter approval/rejection notes (required for rejection)..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            onClick={handleApprove}
                            disabled={processing}
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            onClick={handleReject}
                            disabled={processing}
                        >
                            Reject
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                            disabled={processing}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReviewModal
