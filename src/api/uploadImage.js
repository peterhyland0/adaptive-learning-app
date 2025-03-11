import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

async function uploadImage(file) {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);

    // Upload the image
    await uploadBytes(storageRef, file);
    console.log("Image uploaded!");

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}
