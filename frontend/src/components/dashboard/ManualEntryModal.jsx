
import { useState } from 'react'

const ManualEntryModal = ({ isOpen, onClose, platforms, onSubmit, processing }) => {
    const [formData, setFormData] = useState({
        platformAccountId: '',
        totalSolved: '',
        contestRating: '',
        snapshotDate: new Date().toISOString().split('T')[0]
    })

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.platformAccountId || !formData.totalSolved || !formData.snapshotDate) {
            alert("Please fill in all required fields")
            return
        }

        onSubmit({
            platform_account_id: formData.platformAccountId,
            total_solved: parseInt(formData.totalSolved, 10),
            contest_rating: formData.contestRating ? parseInt(formData.contestRating, 10) : null,
            snapshot_date: formData.snapshotDate
        })
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Manual Progress Entry</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Manually update your progress if auto-sync is delayed or unavailable. This will be subject to Counsellor approval.
                                </p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Platform Account</label>
                            <select
                                name="platformAccountId"
                                value={formData.platformAccountId}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                required
                            >
                                <option value="">Select an account...</option>
                                {platforms.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.platform_name} (@{p.username})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Total Solved</label>
                                <input
                                    type="number"
                                    name="totalSolved"
                                    value={formData.totalSolved}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    placeholder="e.g. 150"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Rating (Optional)</label>
                                <input
                                    type="number"
                                    name="contestRating"
                                    value={formData.contestRating}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                    placeholder="e.g. 1400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Snapshot Date</label>
                            <input
                                type="date"
                                name="snapshotDate"
                                value={formData.snapshotDate}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                                required
                            />
                        </div>

                        <div className="mt-5 sm:mt-6 flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                            >
                                {processing ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ManualEntryModal
