// src/screens/Room/RoomScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import { MOCK_ROOMS, USERS } from '../../Data/mockData';
import { getUserProfile } from '../../services/authService';

const RoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  
  // USERS[0] varsayılan olarak sizin hesabınız olarak ele alınmıştır
  const currentUser = USERS[0]; 
  
  // Room verilerini yükle ve kullanıcıyı dinleyici olarak ekle
  useEffect(() => {
    // Orijinal room verisini bul
  const originalRoom = MOCK_ROOMS.find(r => r.id === roomId);
  
  if (originalRoom) {
    // Deep copy oluştur ve gerekli alanları ekle
    const roomCopy = {
      ...originalRoom,
      speakers: originalRoom.speakers || originalRoom.hosts || [],
      listeners: originalRoom.listeners || [],
      moderatorId: currentUser.id === (originalRoom.moderatorId || (originalRoom.hosts)) 
        ? (originalRoom.hosts && originalRoom.hosts.find(host => host.id !== currentUser.id)?.id) || USERS.find(user => user.id !== currentUser.id)?.id 
        : originalRoom.moderatorId || (originalRoom.hosts)
    };
    
    // Kullanıcının konuşmacı olup olmadığını kontrol et
    const isSpeakerIndex = roomCopy.speakers.findIndex(speaker => speaker.id === currentUser.id);
    
    // Eğer kullanıcı konuşmacı ise ve moderatör ise, konuşmacıdan çıkar
    if (isSpeakerIndex !== -1 && roomCopy.moderatorId === currentUser.id) {
      roomCopy.speakers.splice(isSpeakerIndex, 1);
    }
    
    // Kullanıcının dinleyici olup olmadığını kontrol et
    const isListenerIndex = roomCopy.listeners.findIndex(listener => listener.id === currentUser.id);
    
    // Kullanıcı konuşmacı değilse ve dinleyici de değilse, dinleyici olarak ekle
    if (isSpeakerIndex === -1 && isListenerIndex === -1) {
      // Firebase'den güncel profil bilgilerini al
      getUserProfile(currentUser.id)
        .then(profileData => {
          // Profil verisi varsa avatar bilgisini al
          const userAvatar = profileData?.avatar || currentUser.avatar;
          
          roomCopy.listeners.push({
            id: currentUser.id,
            name: currentUser.name,
            avatar: userAvatar, // Firebase'den gelen avatar'ı kullan
            joinedAt: new Date().toISOString()
          });
          console.log(`${currentUser.name} dinleyici olarak eklendi`);
          setRoom(roomCopy);
        })
        .catch(error => {
          console.error("Profil bilgileri alınamadı:", error);
          // Hata durumunda varsayılan avatar ile devam et
          roomCopy.listeners.push({
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            joinedAt: new Date().toISOString()
          });
          setRoom(roomCopy);
        });
    } else {
      setRoom(roomCopy);
    }
  } else {
    Alert.alert('Hata', 'Oda bulunamadı');
    navigation.goBack();
  }
}, [roomId]);
  
  if (!room) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Typography.Body>Yükleniyor...</Typography.Body>
      </SafeAreaView>
    );
  }
  
  // Söz isteme fonksiyonu
  const requestToSpeak = () => {
    Alert.alert(
      'Konuşma İsteği',
      'Konuşmacı olmak için istek gönderildi. Moderatörün onayı bekleniyor.',
      [{ text: 'Tamam' }]
    );
  };
  
  // Odadan ayrılma fonksiyonu
  const leaveRoom = () => {
    Alert.alert(
      'Odadan Ayrıl',
      'Odadan ayrılmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ayrıl', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };
  
  // Kullanıcıları gösterme fonksiyonu
  const renderUser = ({ item, isSpeaker = false }) => {
    // Önce item'in tam bir user nesnesi olup olmadığını kontrol et
    // Eğer sadece ID içeriyorsa USERS listesinden tam nesneyi bul
    const user = item.name && item.avatar ? item : USERS.find(u => u.id === item.id);
    if (!user) return null;
    
    const isCurrentUser = user.id === currentUser.id;
    
    return (
      <View style={styles.userItem}>
        <Image source={{ uri: user.avatar }} style={[
          styles.userAvatar,
          isCurrentUser && styles.currentUserAvatar
        ]} />
        
        {isSpeaker && (
          <View style={styles.micIndicator}>
            <Icon name="mic" size={12} color="white" />
          </View>
        )}
        
        <Typography.Caption 
          style={[
            styles.userName,
            isCurrentUser && styles.currentUserName
          ]}
          numberOfLines={1}
        >
          {isCurrentUser ? 'Sen' : user.name}
        </Typography.Caption>
        
        {user.id === room.moderatorId && (
          <View style={styles.moderatorBadge}>
            <Typography.Caption style={styles.moderatorText}>Moderatör</Typography.Caption>
          </View>
        )}
      </View>
    );
  };
  
  // Konuşmacıları render et
  const renderSpeaker = ({ item }) => renderUser({ item, isSpeaker: true });
  
  // Dinleyicileri render et
  const renderListener = ({ item }) => renderUser({ item, isSpeaker: false });
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={leaveRoom}
        >
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Typography.H3 numberOfLines={1}>{room.title}</Typography.H3>
          {room.isLive && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Typography.Caption style={styles.liveText}>CANLI</Typography.Caption>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="more-vertical" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Konuşmacılar Bölümü */}
      <View style={styles.speakersSection}>
        <View style={styles.sectionHeader}>
          <Typography.Body style={styles.sectionTitle}>Konuşmacılar</Typography.Body>
          <Typography.Caption>{room.speakers.length}</Typography.Caption>
        </View>
        <FlatList
          data={room.speakers}
          renderItem={renderSpeaker}
          keyExtractor={(item, index) => `speaker-${item.id || index}`}
          numColumns={3}
          contentContainerStyle={styles.usersGrid}
          ListEmptyComponent={() => (
            <View style={styles.emptySection}>
              <Typography.Body>Henüz konuşmacı yok.</Typography.Body>
            </View>
          )}
        />
      </View>
      
      {/* Dinleyiciler Bölümü */}
      <View style={styles.listenersSection}>
        <View style={styles.sectionHeader}>
          <Typography.Body style={styles.sectionTitle}>Dinleyiciler</Typography.Body>
          <Typography.Caption>{room.listeners.length}</Typography.Caption>
        </View>
        <FlatList
          data={room.listeners}
          renderItem={renderListener}
          keyExtractor={(item, index) => `listener-${item.id || index}`}
          numColumns={3}
          contentContainerStyle={styles.usersGrid}
          ListEmptyComponent={() => (
            <View style={styles.emptySection}>
              <Typography.Body>Henüz dinleyici yok.</Typography.Body>
            </View>
          )}
        />
      </View>
      
      {/* Alt Kontrol Butonları */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.leaveButton}
          onPress={leaveRoom}
        >
          <Typography.Body style={styles.leaveText}>Sessizce Ayrıl</Typography.Body>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.raiseHandButton}
          onPress={requestToSpeak}
        >
          <Icon name="hand" size={20} color="white" />
          <Typography.Body style={styles.raiseHandText}>Söz İste</Typography.Body>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    backgroundColor: colors.background.dark
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 8
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 6
  },
  liveText: {
    color: colors.error,
    fontWeight: '700'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  sectionTitle: {
    fontWeight: '600'
  },
  speakersSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
    paddingBottom: 8
  },
  listenersSection: {
    flex: 1,
    paddingBottom: 8
  },
  usersGrid: {
    paddingHorizontal: 8
  },
  userItem: {
    width: '33.33%',
    alignItems: 'center',
    padding: 8,
    position: 'relative'
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8
  },
  currentUserAvatar: {
    borderWidth: 2,
    borderColor: colors.primary
  },
  userName: {
    textAlign: 'center',
    width: '100%'
  },
  currentUserName: {
    fontWeight: '700',
    color: colors.primary
  },
  micIndicator: {
    position: 'absolute',
    right: 24,
    top: 54,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.dark
  },
  moderatorBadge: {
    backgroundColor: colors.background.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4
  },
  moderatorText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600'
  },
  bottomControls: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background.light,
    justifyContent: 'space-between'
  },
  leaveButton: {
    backgroundColor: colors.background.light,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center'
  },
  leaveText: {
    color: colors.error
  },
  raiseHandButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center'
  },
  raiseHandText: {
    color: 'white',
    marginLeft: 8
  },
  emptySection: {
    padding: 20,
    alignItems: 'center'
  }
});

export default RoomScreen;