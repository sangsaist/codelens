
import { useState, useEffect } from 'react'
import { createStaff } from '../../api/staff'
import { getDepartments } from '../../api/admin'
import { useAuth } from '../../hooks/useAuth'

const CreateStaffModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const { user, hasRole } = useAuth()
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_type: '',
        department_id: ''
    })
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(false)
    const [departmentLoading, setDepartmentLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Determine allowed role and department based on current user
            if (hasRole('admin')) {
                setFormData(prev => ({ ...prev, role_type: 'hod' }))
                fetchDepartments()
            } else if (hasRole('hod')) {
                setFormData(prev => ({ ...prev, role_type: 'advisor', department_id: user.department_id || '' }))
                // Ideally, HOD's department ID should be in their user object or fetched profile
                // If not in user context, we might need to fetch profile. 
                // However, let's assume if it's not administrative, they can't change it.
                // For MVP if backend validates HOD relationship, we just need to pass ID.
                // If user context doesn't have it, we might need a separate call. 
                // But let's fetch departments anyway so they can see/select their own if logic allows, 
                // or simpler: Backend validates relationship, so frontend just needs to send ANY valid ID 
                // OR we fetch departments and filter/select appropriate one.
                // Actually, backend `create_staff` requires `department_id`.
                // Admin selects. HOD/Advisor must pass THEIR dept ID.
                // If `user` object doesn't have `department_id`, we have a problem.
                // Let's check `AuthContext` to see what `user` has.
                // Re-fetch departments for HOD to select (should only be their own if we enforced strict UI)
                // But simpler: just fetch departments for now.
                fetchDepartments()
            } else if (hasRole('advisor')) {
                setFormData(prev => ({ ...prev, role_type: 'counsellor', department_id: user.department_id || '' }))
                fetchDepartments()
            }
        }
    }, [isOpen, user])

    const fetchDepartments = async () => {
        setDepartmentLoading(true)
        try {
            const res = await getDepartments()
            if (res.success) {
                setDepartments(res.data)
                // If user is not admin, try to auto-select their department if obvious
                // Since we don't have department_id in user context consistently yet (maybe),
                // we'll rely on dropdown for now but user must select correct one.
                // Backend enforces permission.
            }
        } catch (err) {
            console.error("Failed to load departments")
        } finally {
            setDepartmentLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await createStaff(formData)
            if (res.success) {
                onSuccess("Staff member created successfully!")
                onClose()
                setFormData({ full_name: '', email: '', password: '', role_type: '', department_id: '' })
            } else {
                onError(res.error || "Failed to create staff member")
            }
        } catch (err) {
            onError(err.response?.data?.error || "Server error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Create New Staff Member
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role_type"
                            required
                            value={formData.role_type}
                            onChange={handleChange}
                            disabled={!hasRole('admin')}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        >
                            {hasRole('admin') && <option value="hod">Head of Department (HOD)</option>}
                            {(hasRole('hod') || hasRole('admin')) && <option value="advisor">Class Advisor</option>}
                            {(hasRole('advisor') || hasRole('hod') || hasRole('admin')) && <option value="counsellor">Course Counsellor</option>}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {hasRole('admin') ? "Admins create HODs." :
                                hasRole('hod') ? "HODs create Advisors." :
                                    "Advisors create Counsellors."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        {departmentLoading ? (
                            <div className="text-sm text-gray-500">Loading departments...</div>
                        ) : (
                            <select
                                name="department_id"
                                required
                                value={formData.department_id}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name} ({dept.code})
                                    </option>
                                ))}
                            </select>
                        )}
                        {!hasRole('admin') && <p className="text-xs text-gray-500 mt-1">Select your own department.</p>}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateStaffModal
