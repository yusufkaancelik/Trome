import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../config/firebaseConfig';
import { updateUserProfile } from '../../services/authService';
import { uploadProfileImage } from '../../services/storageService';

const EditProfileScreen = ({ navigation, route }) => {
  const { profile } = route.params || {};
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [interests, setInterests] = useState(profile?.interests || []);
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || 'https://i.pravatar.cc/150?img=7');
  const [newImage, setNewImage] = useState(null);
  
  // UI state
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekiyor.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
      setPhotoURL(result.assets[0].uri);
    }
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() === '') return;
    
    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
    }
    
    setNewInterest('');
  };
  
  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(item => item !== interestToRemove));
  };
  
  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz.');
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      let updatedProfile = {
        displayName,
        username,
        bio,
        interests
      };
      
      // Eğer yeni resim seçildiyse, yükle
      if (newImage) {
        const uploadResult = await uploadProfileImage(currentUser.uid, newImage);
        if (uploadResult.success) {
          updatedProfile.photoURL = uploadResult.url;
        }
      }
      
      const result = await updateUserProfile(currentUser.uid, updatedProfile);
      
      if (result.success) {
        Alert.alert(
          'Başarılı',
          'Profil bilgileriniz güncellendi.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(result.error?.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <Typography.H2>Profili Düzenle</Typography.H2>
          
          <View style={{width: 32}} />
        </View>
        
        <View style={styles.avatarSection}>
          <Image 
            source={{ uri: photoURL }} 
            style={styles.profileAvatar}
          />
          
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={pickImage}
          >
            <Typography.Caption style={styles.changeAvatarText}>
              Fotoğrafı Değiştir
            </Typography.Caption>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Typography.Caption style={styles.inputLabel}>Ad Soyad</Typography.Caption>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Adınızı ve soyadınızı girin"
              placeholderTextColor={colors.text.disabled}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Typography.Caption style={styles.inputLabel}>Kullanıcı Adı</Typography.Caption>
            <View style={styles.usernameInput}>
              <Typography.Body style={styles.usernamePrefix}>@</Typography.Body>
              <TextInput
                style={[styles.input, styles.usernameField]}
                value={username}
                onChangeText={setUsername}
                placeholder="kullanıcıadı"
                placeholderTextColor={colors.text.disabled}
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Typography.Caption style={styles.inputLabel}>Biyografi</Typography.Caption>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor={colors.text.disabled}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Typography.Caption style={styles.inputLabel}>İlgi Alanları</Typography.Caption>
            
            <View style={styles.interestTags}>
              {interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Typography.Caption style={styles.interestText}>{interest}</Typography.Caption>
                  <TouchableOpacity
                    style={styles.removeInterestButton}
                    onPress={() => handleRemoveInterest(interest)}
                  >
                    <Icon name="x" size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <View style={styles.addInterestContainer}>
              <TextInput
                style={[styles.input, styles.addInterestInput]}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Yeni ilgi alanı ekle"
                placeholderTextColor={colors.text.disabled}
              />
              <TouchableOpacity 
                style={styles.addInterestButton}
                onPress={handleAddInterest}
              >
                <Icon name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Değişiklikleri Kaydet"
            onPress={handleSave}
            style={styles.saveButton}
            loading={loading}
            disabled={loading}
          />
          
          <Button
            title="İptal"
            onPress={() => navigation.goBack()}
            type="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  scrollContent: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background.light
  },
  changeAvatarText: {
    color: colors.primary,
    fontWeight: '500'
  },
  formSection: {
    marginBottom: 24
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
    color: colors.text.secondary
  },
  input: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 16
  },
  usernameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    paddingHorizontal: 16
  },
  usernamePrefix: {
    color: colors.text.secondary,
    marginRight: 4
  },
  usernameField: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0
  },
  bioInput: {
    minHeight: 100,
    paddingTop: 12
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  interestText: {
    color: colors.primary,
    fontWeight: '500',
    marginRight: 6
  },
  removeInterestButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addInterestContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addInterestInput: {
    flex: 1,
    marginRight: 12
  },
  addInterestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 40
  },
  saveButton: {
    marginBottom: 12
  },
  cancelButton: {
    borderColor: colors.text.disabled
  }
});

export default EditProfileScreen;