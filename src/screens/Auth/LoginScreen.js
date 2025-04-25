import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

// Firebase importları
import { auth } from '../../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { signInWithGoogle, loginWithUsername, loginUser, registerUser } from '../../services/authService';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Google SignIn için WebBrowser'ı ayarla
WebBrowser.maybeCompleteAuthSession();

// Ekran genişliğini al
const screenWidth = Dimensions.get('window').width;

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    usernameOrEmail: '', // E-posta yerine usernameOrEmail kullanıyoruz
    password: '',
    username: '',
    email: '', // Kayıt için hala e-posta gerekli
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Google OAuth için gerekli kurulumlar
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '372352729159-gp9rm4pk0q80a243kgviv1198dcbncln.apps.googleusercontent.com',
    iosClientId: '372352729159-gp9rm4pk0q80a243kgviv1198dcbncln.apps.googleusercontent.com',
    androidClientId: '372352729159-gp9rm4pk0q80a243kgviv1198dcbncln.apps.googleusercontent.com',
    webClientId: '372352729159-gp9rm4pk0q80a243kgviv1198dcbncln.apps.googleusercontent.com',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          navigation.replace('Home');
        } else if (verificationSent) {
          // Kullanıcı email onayı bekliyor
          Alert.alert(
            'E-posta Doğrulama',
            'Lütfen e-posta kutunuzu kontrol edin ve hesabınızı doğrulayın.'
          );
        }
      }
    });

    return () => unsubscribe();
  }, [navigation, verificationSent]);

  // Google Sign-In Response'ını takip et
  useEffect(() => {
    if (response?.type === 'success') {
      setGoogleLoading(true);
      const { id_token } = response.params;
      
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      Alert.alert('Google ile Giriş Hatası', 'Google ile giriş sırasında bir hata oluştu.');
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
      const result = await signInWithGoogle(idToken);
      
      if (result.success) {
        navigation.replace('Home');
      } else {
        throw new Error(result.error?.message || 'Google ile giriş sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('Google ile giriş hatası:', error);
      Alert.alert('Google ile Giriş Hatası', error.message || 'Google ile giriş sırasında bir hata oluştu');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
    
    // Hata varsa temizle
    if (errors[key]) {
      setErrors({
        ...errors,
        [key]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      // Giriş formu doğrulama
      if (!formData.usernameOrEmail) {
        newErrors.usernameOrEmail = 'Kullanıcı adı gerekli';
      }
    } else {
      // Kayıt formu doğrulama
      if (!formData.email) {
        newErrors.email = 'E-posta adresi gerekli';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }
      
      if (!formData.username) {
        newErrors.username = 'Kullanıcı adı gerekli';
      }
    }
    
    // Şifre kontrolü - her iki formda da gerekli
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Giriş işlemi - kullanıcı adı ile
        let result;
        
        // E-posta mı kullanıcı adı mı olduğunu kontrol et
        const isEmail = /\S+@\S+\.\S+/.test(formData.usernameOrEmail);
        
        if (isEmail) {
          // E-posta ile giriş
          result = await loginUser(formData.usernameOrEmail, formData.password);
        } else {
          // Kullanıcı adı ile giriş
          result = await loginWithUsername(formData.usernameOrEmail, formData.password);
        }
        
        if (result.success) {
          if (result.user.emailVerified) {
            navigation.replace('Home');
          } else {
            Alert.alert(
              'E-posta Doğrulama',
              'Lütfen e-posta adresinizi doğrulayın ve tekrar giriş yapın.'
            );
          }
        } else {
          // Firebase hata mesajları
          let errorMessage = 'Giriş yapılırken bir hata oluştu';
          
          if (result.error?.code === 'auth/user-not-found') {
            errorMessage = 'Kullanıcı bulunamadı';
          } else if (result.error?.code === 'auth/wrong-password') {
            errorMessage = 'Kullanıcı adı veya şifre hatalı';
          } else if (result.error?.code === 'auth/too-many-requests') {
            errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
          }
          
          Alert.alert('Giriş Hatası', errorMessage);
        }
      } else {
        // Kayıt işlemi
        const result = await registerUser(formData.email, formData.password, formData.username);
        
        if (result.success) {
          setVerificationSent(true);
          Alert.alert(
            'Kayıt Başarılı',
            'Hesabınızı doğrulamak için e-posta adresinize bir link gönderdik. Lütfen e-postanızı kontrol edin.',
            [{ text: 'Tamam', onPress: () => setIsLogin(true) }]
          );
        } else {
          // Firebase hata mesajları
          let errorMessage = 'Kayıt yapılırken bir hata oluştu';
          
          if (result.error?.code === 'auth/email-already-in-use') {
            errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
          } else if (result.error?.code === 'auth/invalid-email') {
            errorMessage = 'Geçersiz e-posta adresi';
          } else if (result.error?.code === 'auth/weak-password') {
            errorMessage = 'Şifre çok zayıf';
          } else if (result.error?.code === 'auth/username-already-in-use') {
            errorMessage = 'Bu kullanıcı adı zaten kullanılıyor';
          }
          
          Alert.alert('Kayıt Hatası', errorMessage);
        }
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      Alert.alert('Hata', error.message || 'İşlem sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
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
            <Image
              source={require('../../../assets/Login logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* TromeApp yazısını kaldırdık */}
          </View>

          <View style={styles.authContainer}>
            <Typography.H2 style={styles.authTitle}>
              {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Typography.H2>

            <View style={styles.formContainer}>
              {isLogin ? (
                // Giriş formu
                <Input
                  label="Kullanıcı Adı"
                  placeholder="Kullanıcı adınızı girin"
                  icon="user"
                  value={formData.usernameOrEmail}
                  onChangeText={(text) => handleInputChange('usernameOrEmail', text)}
                  error={errors.usernameOrEmail}
                  autoCapitalize="none"
                />
              ) : (
                // Kayıt formu - Hem kullanıcı adı hem e-posta gerekli
                <>
                  <Input
                    label="Kullanıcı Adı"
                    placeholder="Kullanıcı adınızı girin"
                    icon="user"
                    value={formData.username}
                    onChangeText={(text) => handleInputChange('username', text)}
                    error={errors.username}
                    autoCapitalize="none"
                  />
                  <Input
                    label="E-posta"
                    placeholder="E-posta adresinizi girin"
                    icon="mail"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </>
              )}

              <Input
                label="Şifre"
                placeholder="Şifrenizi girin"
                icon="lock"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                error={errors.password}
              />

              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Typography.Caption style={styles.forgotPasswordText}>
                    Şifremi Unuttum
                  </Typography.Caption>
                </TouchableOpacity>
              )}

              <Button
                title={isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || googleLoading}
                style={styles.authButton}
              />

              <View style={styles.separatorContainer}>
                <View style={styles.separator} />
                <Typography.Caption style={styles.separatorText}>veya</Typography.Caption>
                <View style={styles.separator} />
              </View>

              <Button
                title="Google ile Devam Et (Yakında)"
                onPress={() => promptAsync()}
                type="outline"
                loading={googleLoading}
                disabled={loading || googleLoading || !request}
                icon={
                  <Image
                    source={require('../../assets/google-icon.png')}
                    style={styles.googleIcon}
                  />
                }
                style={styles.googleButton}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Typography.Body>
                {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
              </Typography.Body>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Typography.Body style={styles.toggleText}>
                  {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
                </Typography.Body>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: screenWidth * 0.7, // Ekran genişliğinin %70'i kadar genişlik
    height: (screenWidth * 0.7) * (4067 / 11285), // Orijinal en-boy oranını koruyarak yükseklik hesaplama
    // 11285 x 4067 orijinal ölçüleriniz için en-boy oranı korundu
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  authTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: colors.primary,
  },
  authButton: {
    marginTop: 8,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text.disabled,
  },
  separatorText: {
    color: colors.text.secondary,
    marginHorizontal: 10,
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  googleButton: {
    backgroundColor: colors.background.medium,
    borderColor: colors.text.disabled,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;