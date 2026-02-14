
import { useState } from 'react'

const StudentList = ({ students, departments, onAssign }) => {
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [selectedDept, setSelectedDept] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [assignLoading, setAssignLoading] = useState(false)

    const openAssignModal = (student) => {
        setSelectedStudent(student)
        setSelectedDept(student.department_id || '')
        setIsModalOpen(true)
    }

    const handleAssign = async (e) => {
        e.preventDefault()
        setAssignLoading(true)
        try {
            await onAssign(selectedStudent.id, selectedDept)
            setIsModalOpen(false)
            setSelectedStudent(null)
        } catch (err) {
            alert("Failed to assign department")
        } finally {
            setAssignLoading(false)
        }
    }

    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 border-b p-6">Student Directory</h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register #</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{student.register_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {student.department_name ? (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {student.department_name}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => openAssignModal(student)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                                        >
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Assign Department: {selectedStudent?.full_name}
                            </h3>

                            <form onSubmit={handleAssign}>
                                <div className="mb-4">
                                    <label htmlFor="dept-select" className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                                    <select
                                        id="dept-select"
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        required
                                    >
                                        <option value="" disabled>Select a department</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={assignLoading}
                                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        {assignLoading ? 'Saving...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentList
