import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

// Profil fotoğrafı yükleme fonksiyonu
export const uploadProfileImage = async (userId, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Firebase Storage'a yükle
    const storageRef = ref(storage, `profile_images/${userId}`);
    await uploadBytes(storageRef, blob);
    
    // Yüklenen resmin URL'sini al
    const downloadURL = await getDownloadURL(storageRef);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error);
    return { success: false, error };
  }
};