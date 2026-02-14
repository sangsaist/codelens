
const ProfileCard = ({ profile }) => {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center space-x-6">
                <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold flex-shrink-0">
                    {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{profile.department_name || "Unassigned"}</span>
                        <span className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{profile.register_number}</span>
                        <span className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">Year: {profile.admission_year}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileCard
