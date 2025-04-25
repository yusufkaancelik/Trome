import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  TextInput,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import RoomCard from '../../components/RoomCard';
import { ThemeContext } from '../../context/ThemeContext';
import { auth, firestore } from '../../config/firebaseConfig';
import { getUserProfile } from '../../services/authService';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// Simüle edilmiş veri
const MOCK_ROOMS = [
  {
    id: '1',
    title: 'Teknoloji Dünyasındaki Son Gelişmeler',
    hosts: [
      { id: '1', name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: '2', name: 'Ayşe Kaya', avatar: 'https://i.pravatar.cc/150?img=2' }
    ],
    participants: 342,
    topics: ['Teknoloji', 'Yapay Zeka', 'Mobil'],
    isLive: true
  },
  {
    id: '2',
    title: 'Müzik Sektöründe Yeni Trendler',
    hosts: [
      { id: '3', name: 'Mehmet Demir', avatar: 'https://i.pravatar.cc/150?img=3' }
    ],
    participants: 128,
    topics: ['Müzik', 'Sanat'],
    isLive: true
  },
  {
    id: '3',
    title: 'Girişimcilik Hikayeleri',
    hosts: [
      { id: '4', name: 'Zeynep Öztürk', avatar: 'https://i.pravatar.cc/150?img=4' },
      { id: '5', name: 'Can Yiğit', avatar: 'https://i.pravatar.cc/150?img=5' }
    ],
    participants: 256,
    topics: ['İş Dünyası', 'Girişimcilik', 'Finans'],
    isLive: true
  },
  {
    id: '4',
    title: 'Sağlıklı Yaşam Önerileri',
    hosts: [
      { id: '6', name: 'Deniz Şahin', avatar: 'https://i.pravatar.cc/150?img=6' }
    ],
    participants: 89,
    topics: ['Sağlık', 'Spor', 'Beslenme'],
    isLive: false,
    scheduledFor: '2023-11-15T18:00:00Z'
  },
  {
    id: '5',
    title: 'Film Önerileri ve Sinema Üzerine',
    hosts: [
      { id: '7', name: 'Berk Özkan', avatar: 'https://i.pravatar.cc/150?img=7' },
      { id: '8', name: 'Selin Koç', avatar: 'https://i.pravatar.cc/150?img=8' }
    ],
    participants: 174,
    topics: ['Sinema', 'Sanat'],
    isLive: true
  }
];

// SearchScreen mock verileri
const MOCK_USERS = [
  { id: '1', name: 'Ahmet Yılmaz', username: '@ahmetyilmaz', avatar: 'https://i.pravatar.cc/150?img=1', followers: 1248 },
  { id: '2', name: 'Ayşe Kaya', username: '@aysekaya', avatar: 'https://i.pravatar.cc/150?img=2', followers: 872 },
  { id: '3', name: 'Mehmet Demir', username: '@mehmetdemir', avatar: 'https://i.pravatar.cc/150?img=3', followers: 1536 },
  { id: '4', name: 'Zeynep Öztürk', username: '@zeynepozturk', avatar: 'https://i.pravatar.cc/150?img=4', followers: 954 },
  { id: '5', name: 'Can Yiğit', username: '@canyigit', avatar: 'https://i.pravatar.cc/150?img=5', followers: 682 }
];

const TRENDING_TOPICS = [
  'Teknoloji', 'Müzik', 'Sanat', 'Spor', 'Girişimcilik', 
  'Finans', 'Oyun', 'Eğitim', 'Kişisel Gelişim', 'Film',
  'Yapay Zeka', 'Flutter', 'React Native', 'iOS', 'Android', 'Web Geliştirme'
];

const TopicChip = ({ topic, selected, onPress }) => (
  <TouchableOpacity 
    style={[styles.topicChip, selected && styles.selectedTopicChip]}
    onPress={onPress}
  >
    <Typography.Caption 
      style={[styles.topicChipText, selected && styles.selectedTopicChipText]}
    >
      {topic}
    </Typography.Caption>
  </TouchableOpacity>
);

// RoomItem bileşeni (SearchScreen'den alındı)
const RoomItem = ({ room, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => onPress(room.id)}
    >
      <View style={styles.roomContent}>
        <View style={styles.roomHeader}>
          <Typography.Body style={styles.roomTitle} numberOfLines={2}>{room.title}</Typography.Body>
          {room.isLive && (
            <View style={styles.liveIndicator}>
              <Typography.Caption style={styles.liveText}>CANLI</Typography.Caption>
            </View>
          )}
        </View>
        
        <View style={styles.roomFooter}>
          <Typography.Caption>{room.participants} katılımcı</Typography.Caption>
          
          <View style={styles.topicsContainer}>
            {room.topics.map(topic => (
              <View key={topic} style={styles.topicTag}>
                <Typography.Caption style={styles.topicText}>{topic}</Typography.Caption>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// UserItem bileşeni (SearchScreen'den alındı)
const UserItem = ({ user, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => onPress(user.id)}
    >
      <Image 
        source={{ uri: user.avatar || user.photoURL || 'https://i.pravatar.cc/150?img=1' }} 
        style={styles.userAvatarSearch}
      />
      
      <View style={styles.userInfo}>
        <Typography.Body style={styles.userName}>{user.name || user.displayName}</Typography.Body>
        <Typography.Caption style={styles.userUsername}>{user.username || user.email}</Typography.Caption>
        <Typography.Caption>{user.followers || 0} takipçi</Typography.Caption>
      </View>
      
      <TouchableOpacity style={styles.followButton}>
        <Typography.Caption style={styles.followButtonText}>Takip Et</Typography.Caption>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [activeTab, setActiveTab] = useState('home');
  const [searchMode, setSearchMode] = useState(false);
  const [searchActiveTab, setSearchActiveTab] = useState('rooms'); // 'rooms' veya 'people'
  // Profil fotoğrafı için state'ler
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  // Firebase kullanıcıları için yeni state'ler
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Kullanıcı profil bilgilerini yükle
    const loadUserProfile = async () => {
      setProfileLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('Kullanıcı oturumu bulunamadı');
          return;
        }
        
        const { success, profile, error } = await getUserProfile(currentUser.uid);
        
        if (success) {
          setProfile(profile);
        } else {
          console.error('Profil yükleme hatası:', error);
        }
      } catch (err) {
        console.error('Profil yükleme hatası:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    // Firebase kullanıcılarını yükle
    const loadFirebaseUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersCollection = collection(db, 'users'); // db kullanın
        const usersSnapshot = await getDocs(usersCollection);
        
        const usersData = [];
        usersSnapshot.forEach((doc) => {
          if (auth.currentUser && doc.id !== auth.currentUser.uid) {
            usersData.push({
              id: doc.id,
              ...doc.data(),
              username: doc.data().username || 
                (doc.data().email ? `@${doc.data().email.split('@')[0]}` : ''),
              followers: doc.data().followers || Math.floor(Math.random() * 1000)
            });
          }
        });
        
        setFirebaseUsers(usersData);
      } catch (err) {
        console.error('Firebase kullanıcıları yükleme hatası:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUserProfile();
    loadFirebaseUsers();

    // Navigation event listener ekleyerek profil düzenlendiğinde yeniden yükle
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
      loadFirebaseUsers();
    });

    return unsubscribe;
  }, [navigation]);
  
  // Arama yapıldığında Firebase kullanıcılarını daha spesifik olarak filtrele
  useEffect(() => {
    if (searchMode && searchActiveTab === 'people' && searchQuery.length > 2) {
      const fetchSearchedUsers = async () => {
        setLoadingUsers(true);
        try {
          const usersRef = collection(db, 'users'); // db kullanın
          const lowerCaseQuery = searchQuery.toLowerCase();
          
          const usersSnapshot = await getDocs(usersRef);
          
          const filteredUsers = [];
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            
            if (auth.currentUser && doc.id === auth.currentUser.uid) {
              return;
            }
            
            const displayName = (userData.displayName || '').toLowerCase();
            const username = (userData.username || '').toLowerCase();
            const email = (userData.email || '').toLowerCase();
            
            if (displayName.includes(lowerCaseQuery) || 
                username.includes(lowerCaseQuery) || 
                email.includes(lowerCaseQuery)) {
              filteredUsers.push({
                id: doc.id,
                ...userData,
                username: userData.username || 
                  (userData.email ? `@${userData.email.split('@')[0]}` : ''),
                followers: userData.followers || Math.floor(Math.random() * 1000)
              });
            }
          });
          
          setFirebaseUsers(filteredUsers);
        } catch (err) {
          console.error('Kullanıcı arama hatası:', err);
        } finally {
          setLoadingUsers(false);
        }
      };
      
      fetchSearchedUsers();
    }
  }, [searchQuery, searchMode, searchActiveTab]);

  const handleRoomPress = (roomId) => {
    navigation.navigate('RoomScreen', { roomId });
  };
  
  const handleUserPress = (userId) => {
    navigation.navigate('ProfileScreen', { userId });
  };
  
  const toggleTopicSelection = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };
  
  // Mock ve Firebase kullanıcılarını birleştir
  const allUsers = [...MOCK_USERS, ...firebaseUsers];
  
  // SearchScreen için filtreleme fonksiyonları
  const filteredRooms = MOCK_ROOMS.filter(room => 
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredUsers = allUsers.filter(user => {
    const query = searchQuery.toLowerCase();
    const name = (user.name || user.displayName || '').toLowerCase();
    const username = (user.username || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return name.includes(query) || username.includes(query) || email.includes(query);
  });
  
  // Ana ekran için filtreleme
  useEffect(() => {
    if (!searchMode) {
      let homeFilteredRooms = MOCK_ROOMS;
      
      // Arama filtresi
      if (searchQuery) {
        homeFilteredRooms = homeFilteredRooms.filter(room => 
          room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.topics.some(topic => 
            topic.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      
      // Konu filtresi
      if (selectedTopics.length > 0) {
        homeFilteredRooms = homeFilteredRooms.filter(room =>
          room.topics.some(topic => selectedTopics.includes(topic))
        );
      }
      
      setRooms(homeFilteredRooms);
    }
  }, [searchQuery, selectedTopics, searchMode]);

  const handleTabPress = (tabName) => {
    if (tabName === 'create') {
      navigation.navigate('CreateRoomScreen');
    } else if (tabName === 'messages') {
      navigation.navigate('MessagesScreen'); // Burada mesajlar sayfasına yönlendirme eklendi
    } else {
      setActiveTab(tabName);
      if (tabName === 'explore') {
        setSearchMode(true);
      } else {
        setSearchMode(false);
      }
    }
  };

  const renderEmptySearch = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.sectionHeader}>
          <Typography.H3>Popüler Konular</Typography.H3>
        </View>
        
        <View style={styles.trendingTopics}>
          {TRENDING_TOPICS.map(topic => (
            <TouchableOpacity 
              key={topic}
              style={styles.trendingTopicTag}
              onPress={() => {
                setSearchQuery(topic);
                if (searchMode) {
                  setSearchActiveTab('rooms');
                }
              }}
            >
              <Typography.Body style={styles.trendingTopicText}>{topic}</Typography.Body>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Ana ekran içeriği
  const renderHomeContent = () => {
    return (
      <>
        <View style={styles.trendingTopicsContainer}>
          <Typography.Body style={styles.sectionTitle}>
            Popüler Konular
          </Typography.Body>
          
          <FlatList
            data={TRENDING_TOPICS.slice(0, 10)} // İlk 10 konu
            renderItem={({ item }) => (
              <TopicChip 
                topic={item}
                selected={selectedTopics.includes(item)}
                onPress={() => toggleTopicSelection(item)}
              />
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsListContent}
          />
        </View>
        
        <View style={styles.roomsContainer}>
          <View style={styles.roomsHeader}>
            <Typography.Body style={styles.sectionTitle}>
              Canlı Odalar
            </Typography.Body>
            
            <TouchableOpacity onPress={() => navigation.navigate('AllRoomsScreen')}>
              <Typography.Caption style={styles.seeAllButton}>
                Tümünü Gör
              </Typography.Caption>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={rooms}
            renderItem={({ item }) => (
              <RoomCard room={item} onPress={() => handleRoomPress(item.id)} />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.roomsListContent}
          />
        </View>
      </>
    );
  };

  // Arama ekranı içeriği
  const renderSearchContent = () => {
    if (searchQuery.length === 0) {
      return renderEmptySearch();
    }

    return (
      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, searchActiveTab === 'rooms' && styles.activeTab]}
            onPress={() => setSearchActiveTab('rooms')}
          >
            <Typography.Body style={[
              styles.tabText, 
              searchActiveTab === 'rooms' && styles.activeTabText
            ]}>
              Odalar
            </Typography.Body>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, searchActiveTab === 'people' && styles.activeTab]}
            onPress={() => setSearchActiveTab('people')}
          >
            <Typography.Body style={[
              styles.tabText, 
              searchActiveTab === 'people' && styles.activeTabText
            ]}>
              Kişiler
            </Typography.Body>
          </TouchableOpacity>
        </View>
        
        {searchActiveTab === 'rooms' ? (
          <FlatList
            data={filteredRooms}
            renderItem={({ item }) => <RoomItem room={item} onPress={handleRoomPress} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyResult}>
                <Typography.Body>Aranan odalar bulunamadı.</Typography.Body>
              </View>
            )}
          />
        ) : (
          <>
            {loadingUsers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Typography.Body style={styles.loadingText}>Kullanıcılar yükleniyor...</Typography.Body>
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={({ item }) => <UserItem user={item} onPress={handleUserPress} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <View style={styles.emptyResult}>
                    <Typography.Body>Aranan kişiler bulunamadı.</Typography.Body>
                  </View>
                )}
              />
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background.dark}]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {!searchMode ? (
            <Typography.H2>Trome</Typography.H2>
          ) : (
            <Typography.H2>Keşfet</Typography.H2>
          )}
          
          <View style={styles.headerActions}>
            {!searchMode && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('NotificationsScreen')}
              >
                <View style={styles.notificationBadge} />
                <Icon name="bell" size={24} color={theme.text.primary} />
              </TouchableOpacity>
            )}
              
            <TouchableOpacity 
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ProfileScreen')}
            >
              {profileLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Image 
                  source={{ 
                    uri: profile?.photoURL || 'https://i.pravatar.cc/150?img=7'
                  }}
                  style={styles.userAvatar}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.searchBar, {backgroundColor: theme.background.light}]}>
          <View style={styles.searchIconContainer}>
            <Icon name="search" size={18} color={theme.text.disabled} />
          </View>
          <TextInput
            style={[styles.searchInput, {color: theme.text.primary}]}
            placeholder={searchMode ? "Sohbet odası, kişi veya konu ara..." : "Oda veya konu ara..."}
            placeholderTextColor={theme.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              if (!searchMode && activeTab === 'home') {
                setSearchMode(true);
                setActiveTab('explore');
              }
            }}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="x" size={18} color={theme.text.disabled} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {searchMode ? renderSearchContent() : renderHomeContent()}
      
      {/* Create Room Button (Floating) */}{activeTab === 'home' && (
        <TouchableOpacity 
        style={styles.createRoomFloatingButton}
        onPress={() => handleTabPress('create')}
      >
        <View style={styles.createButtonIconFloating}>
          <Icon name="plus" size={24} color="white" />
        </View>
      </TouchableOpacity>
      )}
      
      {/* Bottom Tab Navigation */}
      <View style={[styles.bottomTabBar, {backgroundColor: theme.background.medium}]}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]} 
          onPress={() => handleTabPress('home')}
        >
          <Icon 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? colors.primary : theme.text.secondary} 
          />
          <Typography.Caption 
            style={[
              styles.tabLabel, 
              activeTab === 'home' && {color: colors.primary}
            ]}
          >
            Anasayfa
          </Typography.Caption>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'explore' && styles.activeTabItem]} 
          onPress={() => handleTabPress('explore')}
        >
          <Icon 
            name="compass" 
            size={24} 
            color={activeTab === 'explore' ? colors.primary : theme.text.secondary} 
          />
          <Typography.Caption 
            style={[
              styles.tabLabel, 
              activeTab === 'explore' && {color: colors.primary}
            ]}
          >
            Keşfet
          </Typography.Caption>
        </TouchableOpacity>
        
        {/* Yeni Mesajlar Tab'ı */}
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'messages' && styles.activeTabItem]} 
          onPress={() => handleTabPress('messages')}
        >
          <Icon 
            name="message-circle" 
            size={24} 
            color={activeTab === 'messages' ? colors.primary : theme.text.secondary} 
          />
          <Typography.Caption 
            style={[
              styles.tabLabel, 
              activeTab === 'messages' && {color: colors.primary}
            ]}
          >
            Mesajlar
          </Typography.Caption>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    zIndex: 1
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatar: {
    width: 40,
    height: 40,
  },
  userAvatarSearch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46
  },
  searchIconContainer: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontSize: 16
  },
  clearButton: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  trendingTopicsContainer: {
    marginTop: 8,
    paddingHorizontal: 20
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600'
  },
  topicsListContent: {
    paddingRight: 20
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.light,
    borderRadius: 20,
    marginRight: 8
  },
  selectedTopicChip: {
    backgroundColor: colors.primary
  },
  topicChipText: {
    color: colors.text.secondary
  },
  selectedTopicChipText: {
    color: colors.text.primary
  },
  roomsContainer: {
    flex: 1,
    marginTop: 24,
    paddingHorizontal: 20
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  seeAllButton: {
    color: colors.primary
  },
  roomsListContent: {
    paddingBottom: 100
  },
  hostNames: {
    fontWeight: '500'
  },
  
  // Yeni Floating Create Room butonu
  createRoomFloatingButton: {
    position: 'absolute',
    bottom: 80, // Bottom tab'ın üzerinde olacak şekilde
    alignSelf: 'center',
    zIndex: 100
  },
  createButtonIconFloating: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  
  // Bottom Tab Bar styles - güncellendi
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    paddingBottom: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 5
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    color: colors.text.secondary
  },
  
  // Search screen styles
  tabContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 80 // bottom tab için alan bırak
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.background.light,
    padding: 4
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: colors.primary
  },
  tabText: {
    color: colors.text.secondary
  },
  activeTabText: {
    color: colors.white
  },
  listContent: {
    paddingBottom: 100
  },
  emptyResult: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 80
  },
  sectionHeader: {
    marginBottom: 20
  },
  trendingTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  trendingTopicTag: {
    backgroundColor: colors.background.light,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10
  },
  trendingTopicText: {
    color: colors.text.primary
  },
  
  // Room item styles
  roomCard: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  roomContent: {
    flex: 1
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  roomTitle: {
    flex: 1,
    marginRight: 10,
    fontWeight: '600'
  },
  liveIndicator: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  liveText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 10
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topicsContainer: {
    flexDirection: 'row'
  },
  topicTag: {
    backgroundColor: colors.background.medium,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6
  },
  topicText: {
    color: colors.text.secondary,
    fontSize: 10
  },
  
  // User item styles
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background.light,
    borderRadius: 16,
    marginBottom: 12
  },
  userInfo: {
    flex: 1,
    marginLeft: 10
  },
  userName: {
    fontWeight: '600'
  },
  userUsername: {
    color: colors.text.secondary,
    marginBottom: 4
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  followButtonText: {
    color: colors.white,
    fontWeight: '600'
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary
  }
});

export default HomeScreen;