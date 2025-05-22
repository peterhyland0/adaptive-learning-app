export const fetchAdminStudents = async (adminUid) => {
  try {
    const response = await fetch(`http://0.0.0.0:8000/api/admin/${adminUid}/students`);
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }
    const result = await response.json();
    return result.students;
  } catch (error) {
    console.error(error);
    return [];
  }
};
