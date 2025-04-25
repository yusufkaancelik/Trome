// src/screens/Auth/EmailVerificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { firebase } from '../../config/firebaseConfig';
import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { ThemeContext } from '../../context/ThemeContext';

const EmailVerificationScreen = ({ route, navigation }) => {
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { email } = route.params || {};
  const { theme } = React.useContext(ThemeContext);
  
  // Geri sayım için timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);
  
  // E-posta doğrulama durumunu kontrol etme
  const checkVerification = async () => {
    setVerifying(true);
    try {
      // Kullanıcı oturumunu yenile (bu, kullanıcının emailVerified özelliğini günceller)
      await firebase.auth().currentUser.reload();
      const user = firebase.auth().currentUser;
      
      if (user.emailVerified) {
        // E-posta doğrulandı, profil oluşturma ekranına yönlendir
        navigation.navigate('SetupProfile');
      } else {
        // E-posta henüz doğrulanmamış
        Alert.alert(
          'Doğrulama Bekliyor',
          'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin ve doğrulama işlemini tamamlayın.'
        );
      }
    } catch (error) {
      console.error('Doğrulama kontrolü hatası:', error);
      Alert.alert(
        'Doğrulama Hatası',
        'E-posta doğrulama durumu kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      } finally {
        setVerifying(false);
      }
      };
      
      // E-posta doğrulama bağlantısını tekrar gönderme
      const resendVerificationEmail = async () => {
        try {
          const user = firebase.auth().currentUser;
          await user.sendEmailVerification();
          setCountdown(60); // Geri sayımı sıfırla
          Alert.alert(
            'E-posta Gönderildi',
            'Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.'
          );
        } catch (error) {
          console.error('E-posta gönderme hatası:', error);
          Alert.alert(
            'Gönderme Hatası',
            'Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
          );
        }
      };
      
      return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Typography variant="h2" style={[styles.title, { color: theme.text }]}>
            E-posta Doğrulama
          </Typography>
          
          <Typography style={[styles.description, { color: theme.text }]}>
            {email} adresine bir doğrulama e-postası gönderdik. Lütfen gelen kutunuzu kontrol edin 
            ve e-postadaki bağlantıya tıklayarak hesabınızı doğrulayın.
          </Typography>
          
          <Button 
            title="Doğrulama Durumunu Kontrol Et" 
            onPress={checkVerification} 
            loading={verifying}
            style={styles.button}
          />
          
          <Button 
            title={`Tekrar Gönder${countdown > 0 ? ` (${countdown})` : ''}`}
            onPress={resendVerificationEmail}
            disabled={countdown > 0}
            type="outline"
            style={styles.button}
          />
          
          <Button 
            title="Giriş Ekranına Dön" 
            onPress={() => navigation.navigate('Login')}
            type="text"
            style={styles.button}
          />
        </View>
      );
      };
      
      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          justifyContent: 'center',
          alignItems: 'center',
        },
        title: {
          marginBottom: 20,
          textAlign: 'center',
        },
        description: {
          marginBottom: 30,
          textAlign: 'center',
          lineHeight: 22,
        },
        button: {
          marginVertical: 10,
          minWidth: '80%',
        },
      });
      
      export default EmailVerificationScreen;