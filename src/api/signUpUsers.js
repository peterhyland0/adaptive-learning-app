export const signUpUsers = async (email, password, additionalInfo) => {
  const response = await fetch('http://0.0.0.0:8000/api/signup-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      // username: additionalInfo.username,
      admin: additionalInfo.admin || false,
      adminUid: additionalInfo.userUid, // changed from userUid to adminUid
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Sign up failed');
  }

  return await response.json();
};
