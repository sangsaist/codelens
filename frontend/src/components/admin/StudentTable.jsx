
import { useState } from 'react'

const StudentTable = ({ students, departments, loading, onAssign, onUnassign, onDelete, onError }) => {
    const [selectedDept, setSelectedDept] = useState({})

    const handleAssignChange = (studentId, deptId) => {
        setSelectedDept({ ...selectedDept, [studentId]: deptId })
    }

    const handleAssignSubmit = (studentId) => {
        const deptId = selectedDept[studentId]
        if (!deptId) return
        onAssign(studentId, deptId)
        setSelectedDept({ ...selectedDept, [studentId]: '' }) // Reset selection
    }

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Student Directory</h3>
                <span className="text-sm text-gray-500">{students.length} total</span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register #</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No students found</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.register_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.department_name ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {student.department_name}
                                                </span>
                                                <button
                                                    onClick={() => onUnassign(student.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 underline"
                                                >
                                                    Unassign
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={selectedDept[student.id] || ''}
                                                    onChange={(e) => handleAssignChange(student.id, e.target.value)}
                                                    className="block w-32 rounded-md border-0 py-1 pl-2 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-xs sm:leading-6"
                                                >
                                                    <option value="">Select Dept</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAssignSubmit(student.id)}
                                                    disabled={!selectedDept[student.id]}
                                                    className="inline-flex items-center rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 hover:bg-indigo-100 disabled:opacity-50"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onDelete(student.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentTable
