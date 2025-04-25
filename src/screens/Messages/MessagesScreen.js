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
  ActivityIndicator,
  Alert
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import { ThemeContext } from '../../context/ThemeContext';
import { auth, db } from '../../config/firebaseConfig';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';

// Simulate Firebase users data
const MOCK_USERS = [
  { 
    id: '1', 
    displayName: 'Mert Gündüz', 
    username: '@mert', 
    photoURL: 'https://firebasestorage.googleapis.com/v0/b/tromeapp-59162.firebasestorage.app/o/profile_images%2FrpyMPbWpgtcTVbm4dvpBskTLtRJ2?alt=media&token=0233c3c6-f788-4461-a963-8f7dfd4bfe55', 
    followers: 1248,
    online: true,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30)
  },
  { 
    id: '2', 
    displayName: 'Ayşe Kaya', 
    username: '@aysekaya', 
    photoURL: 'https://i.pravatar.cc/150?img=2', 
    followers: 872,
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
  },
  { 
    id: '3', 
    displayName: 'Mehmet Demir', 
    username: '@mehmetdemir', 
    photoURL: 'https://i.pravatar.cc/150?img=3', 
    followers: 1536,
    online: true,
    lastSeen: new Date()
  },
  { 
    id: '4', 
    displayName: 'Zeynep Öztürk', 
    username: '@zeynepozturk', 
    photoURL: 'https://i.pravatar.cc/150?img=4', 
    followers: 954,
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  { 
    id: '5', 
    displayName: 'Can Yiğit', 
    username: '@canyigit', 
    photoURL: 'https://i.pravatar.cc/150?img=5', 
    followers: 682,
    online: true,
    lastSeen: new Date()
  },
  { 
    id: '6', 
    displayName: 'Deniz Şahin', 
    username: '@denizsakin', 
    photoURL: 'https://i.pravatar.cc/150?img=6', 
    followers: 1120,
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15) // 15 min ago
  },
  { 
    id: '7', 
    displayName: 'Elif Yıldız', 
    username: '@elifyildiz', 
    photoURL: 'https://i.pravatar.cc/150?img=7', 
    followers: 892,
    online: true,
    lastSeen: new Date()
  },
  { 
    id: '8', 
    displayName: 'Burak Aydın', 
    username: '@burakaydin', 
    photoURL: 'https://i.pravatar.cc/150?img=8', 
    followers: 743,
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
];

// Format last seen time
const formatLastSeen = (time) => {
  if (!time) return '';
  
  const now = new Date();
  const lastSeen = time instanceof Date ? time : new Date(time);
  const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Şimdi çevrimiçi';
  if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return lastSeen.toLocaleDateString();
};

// Contact Item Component
const ContactItem = ({ user, onPress, onMessagePress }) => {
  return (
    <TouchableOpacity 
      style={styles.contactCard}
      onPress={() => onPress(user)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: user.photoURL || 'https://i.pravatar.cc/150?img=1' }} 
          style={styles.userAvatar}
        />
        {user.online && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.userInfo}>
        <Typography.Body style={styles.userName}>{user.displayName}</Typography.Body>
        <Typography.Caption style={styles.userUsername}>{user.username}</Typography.Caption>
        <Typography.Caption style={styles.lastSeen}>
          {user.online ? 'Çevrimiçi' : formatLastSeen(user.lastSeen)}
        </Typography.Caption>
      </View>
      
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => onMessagePress(user)}
      >
        <Icon name="message-circle" size={20} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ContactsScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // 'all', 'online', 'recent'

  useEffect(() => {
    // Set navigation options
    navigation.setOptions({
      headerTitle: 'Kişiler',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('AddContactScreen')}
        >
          <Icon name="user-plus" size={22} color={theme.text.primary} />
        </TouchableOpacity>
      )
    });

    // Load contacts
    const loadContacts = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, fetch contacts from Firebase
        /*
        if (auth.currentUser) {
          const contactsRef = collection(db, 'users', auth.currentUser.uid, 'contacts');
          const contactsSnapshot = await getDocs(contactsRef);
          
          const contactsData = [];
          for (const contactDoc of contactsSnapshot.docs) {
            const userData = contactDoc.data();
            const userDoc = await getDoc(doc(db, 'users', userData.userId));
            
            if (userDoc.exists()) {
              contactsData.push({
                id: userData.userId,
                ...userDoc.data(),
                contactAddedAt: userData.addedAt
              });
            }
          }
          
          setContacts(contactsData);
          setFiltered(contactsData);
        }
        */
        
        // Use mock data for now
        setTimeout(() => {
          setContacts(MOCK_USERS);
          setFiltered(MOCK_USERS);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error loading contacts:', error);
        setLoading(false);
        Alert.alert('Hata', 'Kişiler yüklenirken bir sorun oluştu.');
      }
    };
    
    loadContacts();
    
    return () => {
      // Clean up any subscriptions
    };
  }, [navigation]);

  // Filter contacts based on search query and active tab
  useEffect(() => {
    let results = [...contacts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(user => 
        (user.displayName && user.displayName.toLowerCase().includes(query)) ||
        (user.username && user.username.toLowerCase().includes(query))
      );
    }
    
    // Apply tab filter
    if (activeTab === 'online') {
      results = results.filter(user => user.online);
    } else if (activeTab === 'recent') {
      // Sort by last interaction (in a real app, would be based on message history)
      results.sort((a, b) => 
        (a.lastSeen instanceof Date ? a.lastSeen : new Date(a.lastSeen))
      );
    }
    
    setFiltered(results);
  }, [contacts, searchQuery, activeTab]);

  const handleContactPress = (user) => {
    navigation.navigate('ProfileScreen', { userId: user.id });
  };
  
  const handleMessagePress = (user) => {
    // In a real implementation, would check for existing conversation
    // or create a new one before navigating
    
    // Generate conversation ID (in real app, would be fetched from or created in Firestore)
    const conversationId = `conv_${auth.currentUser?.uid || 'currentUser'}_${user.id}`;
    
    navigation.navigate('ChatScreen', { 
      conversationId,
      user: {
        id: user.id,
        name: user.displayName,
        photoURL: user.photoURL
      }
    });
  };
  
  // Render letter divider for alphabetical sections
  const renderLetterDivider = (letter) => (
    <View style={[styles.letterDivider, {backgroundColor: theme.background.medium}]}>
      <Typography.Caption style={styles.letterText}>{letter}</Typography.Caption>
    </View>
  );

  // Process contacts to add section headers if needed
  const processedContacts = () => {
    if (activeTab !== 'all' || searchQuery) {
      // Don't show alphabet dividers when filtering or searching
      return filtered;
    }
    
    // Group contacts alphabetically
    const sortedContacts = [...filtered].sort((a, b) => 
      (a.displayName || '').localeCompare(b.displayName || '')
    );
    
    const processed = [];
    let currentLetter = '';
    
    sortedContacts.forEach(contact => {
      const firstLetter = (contact.displayName || '')[0]?.toUpperCase();
      
      if (firstLetter && firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        processed.push({
          id: `letter_${firstLetter}`,
          type: 'header',
          letter: firstLetter
        });
      }
      
      processed.push({
        ...contact,
        type: 'contact'
      });
    });
    
    return processed;
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return renderLetterDivider(item.letter);
    }
    
    return (
      <ContactItem 
        user={item} 
        onPress={handleContactPress}
        onMessagePress={handleMessagePress}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background.dark}]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, {backgroundColor: theme.background.light}]}>
          <Icon name="search" size={18} color={theme.text.disabled} />
          <TextInput
            style={[styles.searchInput, {color: theme.text.primary}]}
            placeholder="Kişi ara..."
            placeholderTextColor={theme.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={18} color={theme.text.disabled} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'all' && styles.activeTab,
            activeTab === 'all' && {borderBottomColor: colors.primary}
          ]}
          onPress={() => setActiveTab('all')}
        >
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'recent' && styles.activeTab,
            activeTab === 'recent' && {borderBottomColor: colors.primary}
          ]}
          onPress={() => setActiveTab('recent')}
        >
          <Typography.Body style={[
            styles.tabText,
            activeTab === 'recent' && {color: colors.primary}
          ]}>
            Son Görüşmeler
          </Typography.Body>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'online' && styles.activeTab,
            activeTab === 'online' && {borderBottomColor: colors.primary}
          ]}
          onPress={() => setActiveTab('online')}
        >
          <Typography.Body style={[
            styles.tabText,
            activeTab === 'online' && {color: colors.primary}
          ]}>
            Çevrimiçi
          </Typography.Body>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography.Body style={styles.loadingText}>Kişiler yükleniyor...</Typography.Body>
        </View>
      ) : (
        <FlatList
          data={processedContacts()}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="users" size={60} color={theme.text.disabled} />
              <Typography.Body style={styles.emptyText}>Hiç kişi bulunamadı</Typography.Body>
              <TouchableOpacity 
                style={styles.addContactButton}
                onPress={() => navigation.navigate('AddContactScreen')}
              >
                <Typography.Caption style={styles.addContactButtonText}>
                  Kişi Ekle
                </Typography.Caption>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 46
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  tab: {
    paddingVertical: 12,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomWidth: 2
  },
  tabText: {
    fontWeight: '500',
    color: colors.text.secondary
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary
  },
  contactsList: {
    paddingBottom: 20
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  avatarContainer: {
    position: 'relative'
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background.dark
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  userName: {
    fontWeight: '600'
  },
  userUsername: {
    color: colors.text.secondary
  },
  lastSeen: {
    color: colors.text.disabled,
    fontSize: 12,
    marginTop: 2
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  letterDivider: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.background.medium
  },
  letterText: {
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  emptyText: {
    marginTop: 16,
    color: colors.text.secondary
  },
  addContactButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20
  },
  addContactButtonText: {
    color: colors.white,
    fontWeight: '600'
  }
});

export default ContactsScreen;