import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('E-posta adresi gerekli');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      Alert.alert(
        'Şifre Sıfırlama Gönderildi',
        'Şifrenizi sıfırlamanız için e-posta adresinize bir link gönderdik. Lütfen e-postanızı kontrol edin.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      
      let errorMessage = 'Şifre sıfırlama isteği gönderilirken bir hata oluştu';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresine sahip bir kullanıcı bulunamadı';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="chevron-left" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            
            <Typography.H2>Şifremi Unuttum</Typography.H2>
            
            <View style={{width: 32}} />
          </View>
          
          <View style={styles.content}>
            <Typography.Body style={styles.description}>
              Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin. Size şifre sıfırlama bağlantısı içeren bir e-posta göndereceğiz.
            </Typography.Body>
            
            <Input
              label="E-posta"
              placeholder="E-posta adresinizi girin"
              icon="mail"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!resetSent}
            />
            
            <Button
              title="Şifre Sıfırlama Linki Gönder"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading || resetSent}
              style={styles.resetButton}
            />
            
            <Button
              title="Giriş Ekranına Dön"
              onPress={() => navigation.goBack()}
              type="outline"
              style={styles.backToLoginButton}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40
  },
  description: {
    marginBottom: 24,
    color: colors.text.secondary,
    textAlign: 'center'
  },
  resetButton: {
    marginTop: 24,
    marginBottom: 16
  },
  backToLoginButton: {
    borderColor: colors.text.disabled
  }
});

export default ForgotPasswordScreen;