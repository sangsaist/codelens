
import { useState } from 'react'

const CreateDepartmentForm = ({ onCreate }) => {
    const [formData, setFormData] = useState({ name: '', code: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            await onCreate(formData)
            setFormData({ name: '', code: '' })
        } catch (err) {
            setError("Failed to create department: " + (err.response?.data?.error || err.message))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100 h-full">
            <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-4 mb-4">Create Department</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Department Name</label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="e.g. Computer Science"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">Code</label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="code"
                            id="code"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="e.g. CSE"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating...' : 'Create Department'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateDepartmentForm
