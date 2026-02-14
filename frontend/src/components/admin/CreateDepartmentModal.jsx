
import { useState } from 'react'
import Modal from '../common/Modal'
import { createDepartment } from '../../api/admin'

const CreateDepartmentModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const [formData, setFormData] = useState({ name: '', code: '' })
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await createDepartment(formData)
            if (response.success) {
                setFormData({ name: '', code: '' })
                onSuccess("Department created successfully")
                onClose()
            } else {
                onError(response.error || "Failed to create department")
            }
        } catch (err) {
            onError(err.response?.data?.error || "Failed to create department")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Department">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700">Department Name</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="dept-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="dept-code" className="block text-sm font-medium text-gray-700">Code</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="dept-code"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="e.g. CSE"
                        />
                    </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-70"
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default CreateDepartmentModal
