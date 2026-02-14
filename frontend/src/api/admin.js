
import api from './axios'

export const getDepartments = async () => {
    const response = await api.get('/academics/departments')
    return response.data
}

export const createDepartment = async (data) => {
    const response = await api.post('/academics/departments', data)
    return response.data
}

export const deleteDepartment = async (departmentId) => {
    const response = await api.delete(`/academics/departments/${departmentId}`)
    return response.data
}

export const getAllStudents = async () => {
    const response = await api.get('/students/all')
    return response.data
}

export const assignDepartment = async (studentId, departmentId) => {
    const response = await api.put(`/students/${studentId}/assign-department`, { department_id: departmentId })
    return response.data
}

export const unassignDepartment = async (studentId) => {
    const response = await api.put(`/students/${studentId}/unassign-department`)
    return response.data
}

export const deleteStudent = async (studentId) => {
    const response = await api.delete(`/students/${studentId}`)
    return response.data
}
