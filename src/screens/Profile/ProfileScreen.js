import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  Switch
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import { auth } from '../../config/firebaseConfig';
import { getUserProfile } from '../../services/authService';
import { ThemeContext } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  
  // Modals state
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [createdRoomsModalVisible, setCreatedRoomsModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Animation states
  const [themeModalAnimation] = useState(new Animated.Value(height));
  const [notificationsModalAnimation] = useState(new Animated.Value(height));
  const [privacyModalAnimation] = useState(new Animated.Value(height));
  const [helpModalAnimation] = useState(new Animated.Value(height));
  const [createdRoomsAnimation] = useState(new Animated.Value(height));
  const [languageAnimation] = useState(new Animated.Value(height));
  
  // FAQ state
  const [expandedFaqItem, setExpandedFaqItem] = useState(null);
  
  const faqItems = [
    {
      question: 'Nasıl profil fotoğrafı değiştirebilirim?',
      answer: 'Profil sayfanıza gidin ve düzenle butonuna tıklayın. Orada fotoğrafınızı değiştirebileceğiniz bir seçenek bulacaksınız.',
    },
    {
      question: 'Üyeliğimi nasıl silebilirim?',
      answer: 'Ayarlar menüsünden "Hesabımı Sil" seçeneğini bularak üyeliğinizi silebilirsiniz. Lütfen bu işlemin geri alınamaz olduğunu unutmayın.',
    },
    {
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayarak şifrenizi sıfırlayabilirsiniz. E-posta adresinize bir sıfırlama bağlantısı gönderilecektir.',
    },
    {
      question: 'Bildirimler nasıl kapatılır?',
      answer: 'Ayarlar menüsündeki "Bildirimler" bölümünden istediğiniz bildirim türlerini açıp kapatabilirsiniz.',
    },
  ];
  
  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  
  // Privacy settings
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }
        
        const { success, profile, error } = await getUserProfile(currentUser.uid);
        
        if (success) {
          setProfile(profile);
        } else {
          throw error;
        }
      } catch (err) {
        console.error('Profil yükleme hatası:', err);
        setError(err.message || 'Profil yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();

    // Navigation event listener ekleyerek profil düzenlendiğinde yeniden yükle
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

  // Modal animation handlers
  const openModal = (setModalVisible, modalAnimation) => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = (setModalVisible, modalAnimation) => {
    Animated.timing(modalAnimation, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  // Theme modal functions
  const openThemeModal = () => openModal(setThemeModalVisible, themeModalAnimation);
  const closeThemeModal = () => closeModal(setThemeModalVisible, themeModalAnimation);
  
  // Notifications modal functions
  const openNotificationsModal = () => openModal(setNotificationsModalVisible, notificationsModalAnimation);
  const closeNotificationsModal = () => closeModal(setNotificationsModalVisible, notificationsModalAnimation);
  
  // Privacy modal functions
  const openPrivacyModal = () => openModal(setPrivacyModalVisible, privacyModalAnimation);
  const closePrivacyModal = () => closeModal(setPrivacyModalVisible, privacyModalAnimation);
  
  // Help modal functions
  const openHelpModal = () => openModal(setHelpModalVisible, helpModalAnimation);
  const closeHelpModal = () => closeModal(setHelpModalVisible, helpModalAnimation);

  // Rooms modal
  const openCreatedRoomsModal = () => openModal(setCreatedRoomsModalVisible, createdRoomsAnimation);
  const closeCreatedRoomsModal = () => closeModal(setCreatedRoomsModalVisible, createdRoomsAnimation);
  
  // Language Modal
  const openLanguageModal = () => openModal(setLanguageModalVisible, languageAnimation);
  const closeLanguageModal = () => closeModal(setLanguageModalVisible, languageAnimation);
  
  const applyTheme = (isDark) => {
    if (isDarkMode !== isDark) {
      toggleTheme();
    }
    closeThemeModal();
  };
  
  const toggleFaqItem = (index) => {
    setExpandedFaqItem(expandedFaqItem === index ? null : index);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfileScreen', { profile });
  };

  const handleLogout = () => {
    auth.signOut().then(() => navigation.replace('LoginScreen'));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color={colors.danger} />
          <Typography.Body style={styles.errorText}>{error}</Typography.Body>
          <View style={styles.errorButtonsContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.replace('Profile')}
            >
              <Typography.Body style={styles.retryText}>Tekrar Dene</Typography.Body>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.logoutButtonError}
              onPress={handleLogout}
            >
              <Typography.Body style={styles.logoutTextError}>Çıkış Yap</Typography.Body>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={{width: 32}} />
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Icon name="edit-2" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileHeader}>
          <Image 
            source={{ 
              uri: profile?.photoURL || 'https://i.pravatar.cc/150?img=7'
            }} 
            style={styles.profileAvatar}
          />
          
          <View style={styles.profileNameContainer}>
            <Typography.H2>{profile?.displayName || 'Kullanıcı'}</Typography.H2>
            <Typography.Caption style={styles.username}>@{profile?.username || 'kullanıcı'}</Typography.Caption>
          </View>
        </View>
        
        {profile?.bio ? (
          <View style={styles.bioSection}>
            <Typography.Caption style={styles.sectionTitle}>Hakkımda</Typography.Caption>
            <Typography.Body style={styles.bioText}>{profile.bio}</Typography.Body>
          </View>
        ) : null}
        
        {profile?.interests && profile.interests.length > 0 ? (
          <View style={styles.interestsSection}>
            <Typography.Caption style={styles.sectionTitle}>İlgi Alanları</Typography.Caption>
            <View style={styles.interestTags}>
              {profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Typography.Caption style={styles.interestText}>{interest}</Typography.Caption>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Typography.H3 style={styles.settingsTitle}>Ayarlar</Typography.H3>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openCreatedRoomsModal}
          >
            <Icon name="package" size={20} color={colors.text.primary} />
            <Typography.Body style={styles.settingLabel}>
              Oluşturulan Odalar
            </Typography.Body>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openLanguageModal}
          >
            <Icon name="book" size={20} color={colors.text.primary} />
            <Typography.Body style={styles.settingLabel}>
              Dil Seçimi
            </Typography.Body>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openNotificationsModal}
          >
            <Icon name="bell" size={20} color={colors.text.primary} />
            <Typography.Body style={styles.settingLabel}>
              Bildirimler
            </Typography.Body>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openPrivacyModal}
          >
            <Icon name="lock" size={20} color={colors.text.primary} />
            <Typography.Body style={styles.settingLabel}>
              Gizlilik
            </Typography.Body>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openHelpModal}
          >
            <Icon name="help-circle" size={20} color={colors.text.primary} />
            <Typography.Body style={styles.settingLabel}>
              Yardım
            </Typography.Body>
            <Icon name="chevron-right" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={18} color={colors.danger} style={styles.logoutIcon} />
            <Typography.Body style={styles.logoutText}>Çıkış Yap</Typography.Body>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Oluşturulan Oda Modalı*/}
      <Modal
        visible={createdRoomsModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeCreatedRoomsModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeCreatedRoomsModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background.medium,
                transform: [{ translateY: createdRoomsAnimation }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography.H3 style={{ color: colors.text.primary }}>Oluşturulan Odalar</Typography.H3>
              <TouchableOpacity onPress={closeCreatedRoomsModal}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>      
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>Trome Günümüz Şartları İçin Yeterli Bir Uygulama mı?</Typography.Body>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>NFT'ler Hakkında Bilgiler</Typography.Body>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>ChatGPT Kolaylık mı yoksa Tembellik mi?</Typography.Body>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>Deneme</Typography.Body>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closeCreatedRoomsModal}
            >
              <Typography.Body style={{ color: 'white' }}>Kapat</Typography.Body>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Dil Seçimi Modalı */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeLanguageModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeLanguageModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background.medium,
                transform: [{ translateY: languageAnimation}]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography.H3 style={{ color: colors.text.primary }}>Dil Seçimi</Typography.H3>
              <TouchableOpacity onPress={closeLanguageModal}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>      
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>Türkçe</Typography.Body> 
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>İngilizce</Typography.Body> 
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>Fransızca</Typography.Body> 
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.settingInfo}>
                <Typography.Body style={{ color: colors.text.primary }}>Almanca</Typography.Body> 
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closeLanguageModal}
            >
              <Typography.Body style={{ color: 'white' }}>Seç</Typography.Body>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Bildirimler Modalı */}
      <Modal
        visible={notificationsModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeNotificationsModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeNotificationsModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background.medium,
                transform: [{ translateY: notificationsModalAnimation }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography.H3 style={{ color: colors.text.primary }}>Bildirim Ayarları</Typography.H3>
              <TouchableOpacity onPress={closeNotificationsModal}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Tüm Bildirimleri Aç</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Uygulama bildirimlerini tamamen açar veya kapatır
                  </Typography.Caption>
                </View>
                <Switch 
                  value={pushNotifications} 
                  onValueChange={setPushNotifications}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={pushNotifications ? colors.primary : colors.text.secondary}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Aktivite Bildirimleri</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Beğeni, yorum ve takip bildirimleri
                  </Typography.Caption>
                </View>
                <Switch 
                  value={activityNotifications} 
                  onValueChange={setActivityNotifications}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={activityNotifications ? colors.primary : colors.text.secondary}
                  disabled={!pushNotifications}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Mesaj Bildirimleri</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Yeni mesaj geldiğinde bildirim alın
                  </Typography.Caption>
                </View>
                <Switch 
                  value={messageNotifications} 
                  onValueChange={setMessageNotifications}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={messageNotifications ? colors.primary : colors.text.secondary}
                  disabled={!pushNotifications}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>E-posta Bildirimleri</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Önemli güncellemeleri e-posta olarak alın
                  </Typography.Caption>
                </View>
                <Switch 
                  value={emailNotifications} 
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={emailNotifications ? colors.primary : colors.text.secondary}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closeNotificationsModal}
            >
              <Typography.Body style={{ color: 'white' }}>Kaydet</Typography.Body>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Gizlilik Modalı */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closePrivacyModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closePrivacyModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background.medium,
                transform: [{ translateY: privacyModalAnimation }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography.H3 style={{ color: colors.text.primary }}>Gizlilik Ayarları</Typography.H3>
              <TouchableOpacity onPress={closePrivacyModal}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Gizli Profil</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Profiliniz sadece takipçilerinize görünür
                  </Typography.Caption>
                </View>
                <Switch 
                  value={privateProfile} 
                  onValueChange={setPrivateProfile}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={privateProfile ? colors.primary : colors.text.secondary}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Çevrimiçi Durumunu Göster</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Aktif olduğunuz zamanı başkaları görebilir
                  </Typography.Caption>
                </View>
                <Switch 
                  value={showOnlineStatus} 
                  onValueChange={setShowOnlineStatus}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={showOnlineStatus ? colors.primary : colors.text.secondary}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Okundu Bilgisi</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Mesajları okuduğunuzda diğerleri görebilir
                  </Typography.Caption>
                </View>
                <Switch 
                  value={showReadReceipts} 
                  onValueChange={setShowReadReceipts}
                  trackColor={{ false: colors.background.light, true: colors.primary + '70' }}
                  thumbColor={showReadReceipts ? colors.primary : colors.text.secondary}
                />
              </View>
              
              <TouchableOpacity style={styles.privacyOption}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Engellenen Kullanıcılar</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Engellediğiniz kullanıcıları yönetin
                  </Typography.Caption>
                </View>
                <Icon name="chevron-right" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.privacyOption}>
                <View style={styles.settingInfo}>
                  <Typography.Body style={{ color: colors.text.primary }}>Verilerimi İndir</Typography.Body>
                  <Typography.Caption style={{ color: colors.text.secondary }}>
                    Hesap verilerinizin kopyasını alın
                  </Typography.Caption>
                </View>
                <Icon name="chevron-right" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closePrivacyModal}
            >
              <Typography.Body style={{ color: 'white' }}>Kaydet</Typography.Body>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Yardım Modalı */}
      <Modal
        visible={helpModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeHelpModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeHelpModal}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              { 
                backgroundColor: colors.background.medium,
                transform: [{ translateY: helpModalAnimation }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Typography.H3 style={{ color: colors.text.primary }}>Yardım</Typography.H3>
              <TouchableOpacity onPress={closeHelpModal}>
                <Icon name="x" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.helpContent}>
              <Typography.H3 style={[styles.helpSectionTitle, { color: colors.text.primary }]}>
                Sıkça Sorulan Sorular
              </Typography.H3>
              
              {faqItems.map((item, index) => (
                <View key={index} style={styles.faqItemContainer}>
                  <TouchableOpacity 
                    style={styles.faqQuestion} 
                    onPress={() => toggleFaqItem(index)}
                  >
                    <Typography.Body style={{ color: colors.text.primary, fontWeight: '500', flex: 1 }}>
                      {item.question}
                    </Typography.Body>
                    <Icon
                      name={expandedFaqItem === index ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                  {expandedFaqItem === index && (
                    <View style={styles.faqAnswer}>
                      <Typography.Body style={{ color: colors.text.secondary }}>
                        {item.answer}
                      </Typography.Body>
                    </View>
                  )}
                </View>
              ))}
              
              <Typography.H3 style={[styles.helpSectionTitle, { color: colors.text.primary, marginTop: 24 }]}>
                İletişim
              </Typography.H3>
              
              <TouchableOpacity style={styles.contactOption}>
                <Icon name="mail" size={20} color={colors.primary} style={styles.contactIcon} />
                <Typography.Body style={{ color: colors.text.primary }}>
                  E-posta ile İletişim
                </Typography.Body>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption}>
                <Icon name="message-circle" size={20} color={colors.primary} style={styles.contactIcon} />
                <Typography.Body style={{ color: colors.text.primary }}>
                  Canlı Destek
                </Typography.Body>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption}>
                <Icon name="file-text" size={20} color={colors.primary} style={styles.contactIcon} />
                <Typography.Body style={{ color: colors.text.primary }}>
                  Kullanım Koşulları
                </Typography.Body>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactOption}>
                <Icon name="shield" size={20} color={colors.primary} style={styles.contactIcon} />
                <Typography.Body style={{ color: colors.text.primary }}>
                  Gizlilik Politikası
                </Typography.Body>
              </TouchableOpacity>
              
              <View style={{ height: 20 }} />
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={closeHelpModal}
            >
              <Typography.Body style={{ color: 'white' }}>Kapat</Typography.Body>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 12
  },
  errorButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center'
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginRight: 10
  },
  retryText: {
    color: 'white'
  },
  logoutButtonError: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background.light,
    borderRadius: 8
  },
  logoutTextError: {
    color: colors.danger,
    fontWeight: '500'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.background.light
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 0
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileAvatar: {
    width: 240,
    height: 240,
    borderRadius: 500,
    marginBottom: 16
  },
  profileNameContainer: {
    alignItems: 'center'
  },
  username: {
    color: colors.text.secondary,
    marginTop: 4
  },
  bioSection: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  sectionTitle: {
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500'
  },
  bioText: {
    lineHeight: 22
  },
  interestsSection: {
    marginTop: 16
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  interestTag: {
    backgroundColor: colors.background.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  interestText: {
    color: colors.primary,
    fontWeight: '500'
  },
  // Settings section styles
  settingsSection: {
    marginTop: 24
  },
  settingsTitle: {
    marginBottom: 16,
    color: colors.text.primary
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.background.medium
  },
  settingLabel: {
    flex: 1,
    marginLeft: 16,
    color: colors.text.primary
  },
  settingValue: {
    color: colors.text.secondary,
    marginLeft: 'auto'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: colors.background.light
  },
  logoutIcon: {
    marginRight: 8
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '500'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  modalContent: {
    marginBottom: 24
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },
  // Settings styles
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  settingInfo: {
    flex: 1,
    paddingRight: 12
  },
  // Privacy settings styles
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  // Help modal styles
  helpContent: {
    marginBottom: 16,
    maxHeight: height * 0.5
  },
  helpSectionTitle: {
    marginBottom: 16
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  contactIcon: {
    marginRight: 16
  },
  faqItemContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.background.light,
    paddingBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  faqAnswer: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default ProfileScreen;