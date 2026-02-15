
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Loader from '../components/common/Loader'
import { getAllStudents } from '../api/admin'
import { getMyTeam, assignAdvisor } from '../api/staff'

const HODStudentManagement = () => {
    const [students, setStudents] = useState([])
    const [advisors, setAdvisors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [teamError, setTeamError] = useState(null)

    // Selection Logic
    const [selectedIds, setSelectedIds] = useState([])
    const [targetAdvisor, setTargetAdvisor] = useState("")
    const [filterAssigned, setFilterAssigned] = useState("all") // all, unassigned

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all students (HOD scope) and staff
                const studentRes = await getAllStudents()
                if (studentRes.success) {
                    setStudents(studentRes.data)
                } else {
                    setError(studentRes.error || "Failed to fetch students")
                }

                try {
                    const teamRes = await getMyTeam()
                    if (teamRes.success) {
                        // Filter for advisors
                        const advs = teamRes.data.filter(m => m.role_type === 'advisor')
                        setAdvisors(advs)
                        if (advs.length === 0) {
                            console.warn("No advisors returned in team list.")
                        }
                    } else {
                        setTeamError(teamRes.error || "Failed to fetch team")
                    }
                } catch (e) {
                    console.error("Team fetch error:", e)
                    setTeamError("Could not load advisors list")
                }

            } catch (err) {
                console.error(err)
                setError("Failed to load management data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredStudents.map(s => s.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleAssign = async () => {
        if (!targetAdvisor) return alert("Please select an advisor")
        if (selectedIds.length === 0) return alert("Please select students")

        if (!confirm(`Assign ${selectedIds.length} students to selected advisor?`)) return

        try {
            const res = await assignAdvisor(targetAdvisor, selectedIds)
            if (res.success) {
                alert("Assignment successful!")
                setSelectedIds([])
                setTargetAdvisor("")
                // Refresh data
                const refreshRes = await getAllStudents()
                if (refreshRes.success) setStudents(refreshRes.data)
            } else {
                alert(res.error || "Failed to assign.")
            }
        } catch (err) {
            alert("Error assigning advisor: " + err.message)
        }
    }

    // Filter Logic
    const filteredStudents = students.filter(s => {
        if (filterAssigned === "unassigned") return s.advisor_name === "Unassigned"
        return true
    })

    if (loading) return <Loader />

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Assign Advisors to students in your department.</p>
                    </div>
                    <Link to="/department/dashboard" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                {/* Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{selectedIds.length} Selected</span>
                        <select
                            className="text-sm border-gray-300 rounded-md"
                            value={filterAssigned}
                            onChange={(e) => setFilterAssigned(e.target.value)}
                        >
                            <option value="all">Show All Students</option>
                            <option value="unassigned">Show Unassigned Only</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        {advisors.length > 0 ? (
                            <>
                                <select
                                    className="block w-full sm:w-64 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    value={targetAdvisor}
                                    onChange={(e) => setTargetAdvisor(e.target.value)}
                                >
                                    <option value="">Select Advisor...</option>
                                    {advisors.map(c => (
                                        <option key={c.user_id} value={c.user_id}>{c.full_name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssign}
                                    disabled={selectedIds.length === 0 || !targetAdvisor}
                                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    Assign Advisor
                                </button>
                            </>
                        ) : (
                            <span className="text-sm text-red-500 font-medium">
                                {teamError || "No advisors found in your department."}
                            </span>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            onChange={handleSelectAll}
                                            checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Advisor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Counsellor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => handleSelectOne(student.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.register_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.advisor_name !== "Unassigned" ? (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{student.advisor_name}</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.counsellor_name}</td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No students found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default HODStudentManagement
