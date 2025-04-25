// src/screens/Profile/SelectInterestsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { firebase } from '../../config/firebaseConfig';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { ThemeContext } from '../../context/ThemeContext';

const SelectInterestsScreen = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = React.useContext(ThemeContext);
  
  // İlgi alanları listesi
  const interests = [
    'Müzik', 'Film', 'Kitap', 'Spor', 'Teknoloji', 'Bilim', 
    'Sanat', 'Oyun', 'Yemek', 'Seyahat', 'Fotoğrafçılık', 'Moda',
    'Fitness', 'Dans', 'Tarih', 'Politika', 'Eğitim', 'İş Dünyası',
    'Doğa', 'Sağlık', 'Meditasyon', 'Astroloji', 'Hayvanlar', 'El Sanatları'
  ];

  // İlgi alanını seçme veya seçimi kaldırma
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      // Seçimi kaldır
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      // Eğer zaten 3 ilgi alanı seçildiyse ve yeni bir ilgi alanı seçiliyorsa
      if (selectedInterests.length >= 3) {
        return Alert.alert(
          "Maksimum Seçim",
          "En fazla 3 ilgi alanı seçebilirsiniz. Farklı bir seçim yapmak için önce seçili olanlardan birini kaldırın.",
          [{ text: "Tamam" }]
        );
      }
      // Yeni ilgi alanını ekle
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Seçilen ilgi alanlarını kaydetme
  const saveInterests = async () => {
    // 3 ilgi alanı seçilip seçilmediğini kontrol et
    if (selectedInterests.length !== 3) {
      return Alert.alert(
        "Eksik Seçim",
        "Lütfen tam olarak 3 ilgi alanı seçin.",
        [{ text: "Tamam" }]
      );
    }

    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      // Firestore'a ilgi alanlarını kaydetme
      await firebase.firestore().collection('users').doc(user.uid).update({
        interests: selectedInterests,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // Tema seçme ekranına yönlendirme
      navigation.navigate('SelectTheme');
    } catch (error) {
      console.error('İlgi alanları kaydetme hatası:', error);
      Alert.alert(
        'Hata',
        'İlgi alanlarınız kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView>
        <View style={styles.content}>
          <Typography variant="h1" style={styles.title}>
            İlgi Alanlarını Seç
          </Typography>
          
          <Typography variant="body" style={styles.description}>
            Sana özel içerikler sunabilmemiz için lütfen 3 ilgi alanı seç.
          </Typography>
          
          <View style={styles.counter}>
            <Typography variant="body">
              {`${selectedInterests.length}/3 ilgi alanı seçildi`}
            </Typography>
          </View>
          
          <View style={styles.interestsGrid}>
            {interests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.interestItem,
                  selectedInterests.includes(interest) && styles.selectedInterest
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Typography
                  variant="body"
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.selectedInterestText
                  ]}
                >
                  {interest}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Devam"
          onPress={saveInterests}
          loading={loading}
          disabled={selectedInterests.length !== 3}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
  },
  counter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  interestItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedInterest: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  interestText: {
    color: '#333',
  },
  selectedInterestText: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    width: '100%',
  },
});

export default SelectInterestsScreen;