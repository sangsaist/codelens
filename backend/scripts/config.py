"""
Configuration for CodeLens Test Data Generation
"""

# Departments and basic settings
DEPARTMENTS = [
    {'name': 'Computer Science and Engineering', 'code': 'CSE'},
    {'name': 'Electronics and Communication Engineering', 'code': 'ECE'},
    {'name': 'Information Technology', 'code': 'IT'},
    {'name': 'Mechanical Engineering', 'code': 'MECH'},
    {'name': 'Civil Engineering', 'code': 'CIVIL'},
    {'name': 'Electrical and Electronics Engineering', 'code': 'EEE'},
]

# Generation constraints
GENERATOR_CONFIG = {
    'students_per_department': 150,  # Total: 900 students
    'counsellors_per_department': 2,
    'advisors_per_department': 5,
    'admission_years': [2021, 2022, 2023, 2024],
}

# Platforms for snapshot generation
PLATFORMS = ['LeetCode', 'Codeforces', 'CodeChef']
