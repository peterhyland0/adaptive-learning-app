// localAudioService.js
import RNFS from 'react-native-fs';
import { getDownloadURL } from "firebase/storage";

/**
 * Downloads a file from 'remoteUrl' to a local path.
 * Returns the local file path on success.
 */
export async function downloadAudioFile(remoteUrl, localFileName) {
  try {
    // We'll store the file in the app's DocumentDirectory
    const localPath = `${RNFS.DocumentDirectoryPath}/${localFileName}`;

    // Check if file already exists (to avoid re-downloading)
    const exists = await RNFS.exists(localPath);
    if (exists) {
      return `file://${localPath}`;
    }

    // Download the file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: remoteUrl,
      toFile: localPath,
    }).promise;

    if (downloadResult && downloadResult.statusCode === 200) {
      // Return a 'file://' URI so it can be read locally
      return `file://${localPath}`;
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }
  } catch (error) {
    throw new Error('Audio download error: ' + error.message);
  }
}
