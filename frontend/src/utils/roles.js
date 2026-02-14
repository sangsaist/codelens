
// roles.js

/**
 * Checks if a user object has a specific role.
 * @param {Object} user - The user object (must contain roles array).
 * @param {string} role - The role to check.
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
};

/**
 * Determines the primary dashboard route for a user based on role priority.
 * Priority: Admin > Counsellor > Advisor > Student
 * @param {Object} user 
 * @returns {string} The route path.
 */
export const getPrimaryDashboardRoute = (user) => {
    if (!user || !user.roles) return '/login';

    if (user.roles.includes('admin')) {
        return '/admin/institution';
    }
    if (user.roles.includes('hod')) {
        return '/department/dashboard';
    }
    if (user.roles.includes('counsellor')) {
        return '/counsellor/dashboard';
    }
    if (user.roles.includes('advisor')) {
        return '/advisor/dashboard';
    }
    if (user.roles.includes('student')) {
        return '/dashboard';
    }

    // Default fallback
    return '/';
};
