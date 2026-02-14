
const DepartmentList = ({ departments }) => {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 h-full">
            <h3 className="text-lg font-medium leading-6 text-gray-900 border-b p-6">Departments</h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HOD</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {departments.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No departments found</td>
                            </tr>
                        ) : (
                            departments.map((dept) => (
                                <tr key={dept.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{dept.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {dept.hod_name || <span className="text-gray-400 italic">Unassigned</span>}
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

export default DepartmentList
