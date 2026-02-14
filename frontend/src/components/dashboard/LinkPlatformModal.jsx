
import { useState } from 'react'
import Modal from '../common/Modal'
import { linkPlatform } from '../../api/platforms'

const LinkPlatformModal = ({ isOpen, onClose, onSuccess, onError }) => {
    const [platformName, setPlatformName] = useState('leetcode')
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username.trim()) return

        setIsLoading(true)
        try {
            const response = await linkPlatform(platformName, username)
            if (response.success) {
                onSuccess("Platform linked successfully!")
                setUsername('')
                setPlatformName('leetcode')
                onClose()
            } else {
                onError(response.error || "Failed to link platform")
            }
        } catch (err) {
            onError(err.response?.data?.error || "Failed to link platform")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Link New Platform">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700">Platform</label>
                    <select
                        id="platform"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="leetcode">LeetCode</option>
                        <option value="codeforces">Codeforces</option>
                        <option value="github">GitHub</option>
                        <option value="hackerrank">HackerRank</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <div className="mt-1">
                        <input
                            type="text"
                            id="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                            placeholder="Enter your username"
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Make sure your profile is public so we can fetch your stats.
                    </p>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-70"
                    >
                        {isLoading ? 'Linking...' : 'Link Account'}
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

export default LinkPlatformModal
