// src/screens/Profile/SelectThemeScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { firebase } from '../../config/firebaseConfig';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { ThemeContext } from '../../context/ThemeContext';

const SelectThemeScreen = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = React.useContext(ThemeContext);
  
  // Tema seçenekleri
  const themeOptions = [
    {
      id: 'light',
      name: 'Aydınlık',
      colors: {
        primary: '#3498db',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        cardColor: '#f5f5f5',
      },
    },
    {
      id: 'dark',
      name: 'Karanlık',
      colors: {
        primary: '#3498db',
        backgroundColor: '#121212',
        textColor: '#ffffff',
        cardColor: '#1e1e1e',
      },
    },
    {
      id: 'nature',
      name: 'Doğa',
      colors: {
        primary: '#4CAF50',
        backgroundColor: '#f5f9f0',
        textColor: '#2e7d32',
        cardColor: '#e8f5e9',
      },
    },
    {
      id: 'ocean',
      name: 'Okyanus',
      colors: {
        primary: '#0277bd',
        backgroundColor: '#e1f5fe',
        textColor: '#01579b',
        cardColor: '#b3e5fc',
      },
    },
    {
      id: 'sunset',
      name: 'Gün Batımı',
      colors: {
        primary: '#ff5722',
        backgroundColor: '#fff3e0',
        textColor: '#e64a19',
        cardColor: '#ffe0b2',
      },
    },
  ];

  // Temayı kaydetme
  const saveTheme = async () => {
    if (!selectedTheme) {
      return Alert.alert(
        "Tema Seçimi",
        "Lütfen bir tema seçin.",
        [{ text: "Tamam" }]
      );
    }

    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }
      
      // Firestore'a tema tercihini kaydetme
      await firebase.firestore().collection('users').doc(user.uid).update({
        themePreference: selectedTheme.id,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      
      // ThemeContext ile uygulamanın temasını güncelleme
      setTheme(selectedTheme.colors);
      
      // Kayıt sonrası ana ekrana yönlendirme
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (error) {
      console.error('Tema kaydetme hatası:', error);
      Alert.alert(
        'Hata',
        'Tema tercihiniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Tema örneğini gösteren bileşen
  const ThemePreview = ({ themeOption }) => (
    <View style={[
      styles.previewContainer,
      { backgroundColor: themeOption.colors.backgroundColor }
    ]}>
      <View style={[
        styles.previewHeader,
        { backgroundColor: themeOption.colors.primary }
      ]}>
        <Typography
          variant="body"
          style={{ color: '#ffffff' }}
        >
          Trome
        </Typography>
      </View>
      
      <View style={styles.previewBody}>
        <Typography
          variant="body"
          style={{ color: themeOption.colors.textColor }}
        >
          Örnek Yazı
        </Typography>
        
        <View style={[
          styles.previewCard,
          { backgroundColor: themeOption.colors.cardColor }
        ]}>
          <Typography
            variant="body"
            style={{ color: themeOption.colors.textColor }}
          >
            Oda Kartı
          </Typography>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView>
        <View style={styles.content}>
          <Typography variant="h1" style={styles.title}>
            Tema Seçimi
          </Typography>
          
          <Typography variant="body" style={styles.description}>
            Trome deneyimini kişiselleştirmek için bir tema seçin.
          </Typography>
          
          <View style={styles.themesContainer}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeOption,
                  selectedTheme?.id === option.id && styles.selectedThemeOption
                ]}
                onPress={() => setSelectedTheme(option)}
              >
                <ThemePreview themeOption={option} />
                <Typography
                  variant="body"
                  style={[
                    styles.themeName,
                    selectedTheme?.id === option.id && styles.selectedThemeName
                  ]}
                >
                  {option.name}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Devam"
          onPress={saveTheme}
          loading={loading}
          disabled={!selectedTheme}
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
    marginBottom: 30,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  themeOption: {
    width: '45%',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  selectedThemeOption: {
    borderColor: '#3498db',
  },
  previewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 150,
  },
  previewHeader: {
    padding: 8,
    alignItems: 'center',
  },
  previewBody: {
    padding: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center',
  },
  themeName: {
    textAlign: 'center',
    padding: 8,
  },
  selectedThemeName: {
    fontWeight: 'bold',
    color: '#3498db',
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

export default SelectThemeScreen;