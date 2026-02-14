
import { Link } from 'react-router-dom'

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        403 - Access Denied
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        You do not have permission to access this page.
                    </p>
                </div>
                <div className="mt-5">
                    <Link
                        to="/"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Unauthorized
