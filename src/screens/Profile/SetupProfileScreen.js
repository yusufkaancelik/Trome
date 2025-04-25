// src/screens/Profile/SetupProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../config/firebaseConfig';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Typography } from '../../components/Typography';
import { ThemeContext } from '../../context/ThemeContext';

const SetupProfileScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const { theme } = React.useContext(ThemeContext);

  // Kullanıcı bilgilerini yükler
  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      // Kullanıcı adını e-postadan çıkartma (@ işaretinden önceki kısım)
      const extractedUsername = user.email.split('@')[0];
      setUsername(extractedUsername);
    }
  }, []);

  // Profil fotoğrafı seçme fonksiyonu
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Hata', 'Galeriye erişim izni gerekiyor!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Firebase'e profil fotoğrafı yükleme
  const uploadProfileImage = async (userId) => {
    if (!profileImage) return null;

    try {
      const response = await fetch(profileImage);
      const blob = await response.blob();
      const reference = firebase.storage().ref(`profileImages/${userId}`);
      await reference.put(blob);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Profil fotoğrafı yükleme hatası:', error);
      throw error;
    }
  };

  // Profil bilgilerini kaydetme
  const saveProfile = async () => {
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      // İsim boş ise kullanıcı adını kullan
      const finalDisplayName = displayName.trim() || username;
      
      // Profil fotoğrafı yükleme
      let profileImageUrl = null;
      if (profileImage) {
        profileImageUrl = await uploadProfileImage(user.uid);
      }
      
      // Firestore'a kullanıcı bilgilerini kaydetme
      await firebase.firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: finalDisplayName,
        bio: bio.trim(),
        profileImageUrl: profileImageUrl || '',
        followers: 0,
        following: 0,
        rooms: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      // Firebase Auth kullanıcı profilini güncelleme
      await user.updateProfile({
        displayName: finalDisplayName,
        photoURL: profileImageUrl || '',
      });
      
      // Başarılı kayıt sonrası ilgi alanları seçme ekranına yönlendirme
      navigation.navigate('SelectInterests');
    } catch (error) {
      console.error('Profil kaydetme hatası:', error);
      Alert.alert(
        'Hata',
        'Profil bilgileriniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.content}>
        <Typography variant="h1" style={styles.title}>
          Profilini Oluştur
        </Typography>
        
        <Typography variant="body" style={styles.description}>
          Trome'da kendini gösterme zamanı! Profil bilgilerini doldur ve topluluğa katıl.
        </Typography>
        
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <>
                <View style={styles.placeholderCircle}>
                  <Text style={styles.placeholderText}>{username.charAt(0).toUpperCase()}</Text>
                </View>
                <Typography variant="body" style={styles.imagePickerText}>
                  Profil Fotoğrafı Seç
                </Typography>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Typography variant="body" style={styles.label}>
            İsim
          </Typography>
          <Input
            placeholder="İsmini gir (boş bırakırsan kullanıcı adın kullanılacak)"
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Typography variant="body" style={styles.label}>
            Biyografi
          </Typography>
          <Input
            placeholder="Kendini kısaca tanıt"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.bioInput]}
          />
        </View>
        
        <View style={styles.statsPreview}>
          <View style={styles.statItem}>
            <Typography variant="h3">0</Typography>
            <Typography variant="body">Takipçi</Typography>
          </View>
          <View style={styles.statItem}>
            <Typography variant="h3">0</Typography>
            <Typography variant="body">Takip</Typography>
          </View>
          <View style={styles.statItem}>
            <Typography variant="h3">0</Typography>
            <Typography variant="body">Oda</Typography>
          </View>
        </View>
        
        <Button
          title="Devam"
          onPress={saveProfile}
          loading={loading}
          style={styles.continueButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePicker: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  placeholderCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#888',
  },
  imagePickerText: {
    color: '#3498db',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
});

export default SetupProfileScreen;