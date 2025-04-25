import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

// Kullanıcı kaydı için servis fonksiyonu
export const registerUser = async (email, password, username) => {
  try {
    // Kullanıcı adının kullanılabilir olup olmadığını kontrol et
    const usernameAvailable = await checkUsernameAvailability(username);
    if (!usernameAvailable) {
      return { 
        success: false, 
        error: { 
          code: 'auth/username-already-in-use', 
          message: 'Bu kullanıcı adı zaten kullanılıyor' 
        } 
      };
    }

    // Kullanıcıyı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Doğrulama e-postası gönder
    await sendEmailVerification(userCredential.user);
    
    // Firestore'a kullanıcı bilgilerini kaydet
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username,
      email,
      displayName: username,
      createdAt: serverTimestamp(),
      emailVerified: false,
      bio: '',
      interests: [],
      photoURL: '',
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return { success: false, error };
  }
};

// Kullanıcı adının kullanılabilir olup olmadığını kontrol et
export const checkUsernameAvailability = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty; // Eğer boşsa (kullanıcı adı yoksa) true, değilse false döner
  } catch (error) {
    console.error('Kullanıcı adı kontrolü hatası:', error);
    return false;
  }
};

// Kullanıcı girişi için servis fonksiyonu (e-posta ile)
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Giriş hatası:', error);
    return { success: false, error };
  }
};

// Kullanıcı adı ile giriş için servis fonksiyonu
export const loginWithUsername = async (username, password) => {
  try {
    // Kullanıcı adına göre e-posta adresini bul
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { 
        success: false, 
        error: { 
          code: 'auth/user-not-found', 
          message: 'Kullanıcı bulunamadı' 
        } 
      };
    }
    
    // Kullanıcı bilgilerini al
    const userData = querySnapshot.docs[0].data();
    const email = userData.email;
    
    // E-posta ile giriş yap
    return await loginUser(email, password);
  } catch (error) {
    console.error('Kullanıcı adı ile giriş hatası:', error);
    return { success: false, error };
  }
};

// Google ile giriş için servis fonksiyonu
export const signInWithGoogle = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    // Kullanıcı daha önce kaydedilmiş mi kontrol et
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Kullanıcı Firestore'da yoksa kaydet
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username: userCredential.user.displayName?.replace(/\s+/g, '').toLowerCase() || `user${Math.floor(Math.random() * 10000)}`,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        createdAt: serverTimestamp(),
        emailVerified: userCredential.user.emailVerified,
        bio: '',
        interests: [],
        photoURL: userCredential.user.photoURL || '',
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Google ile giriş hatası:', error);
    return { success: false, error };
  }
};

// Kullanıcı bilgilerini getir
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, profile: userDoc.data() };
    } else {
      return { success: false, error: { message: 'Kullanıcı profili bulunamadı' } };
    }
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return { success: false, error };
  }
};

// Kullanıcı profilini güncelle
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return { success: false, error };
  }
};