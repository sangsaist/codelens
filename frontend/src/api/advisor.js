
import api from './axios'

export const getMyStudents = async () => {
    const response = await api.get('/analytics/advisor/my-students')
    return response.data
}

export const getStudentDetail = async (studentId) => {
    const response = await api.get(`/analytics/advisor/student/${studentId}`)
    return response.data
}
