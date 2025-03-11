// api/uploadFile.js
const uploadFile = async (useruid, files) => {
  const formData = new FormData();
  formData.append("useruid", useruid);
  files.forEach(file => {
    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/pdf", // Adjust based on file type (PDF or image)
      name: file.name || "uploaded_file.pdf",
    });
  });

  const response = await fetch("http://0.0.0.0:8000/api/upload-file", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server Error: ${errorText}`);
  }
  return response.json();
};

export default uploadFile;
