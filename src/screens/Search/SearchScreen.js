// src/screens/Search/SearchScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';

// Örnek veri
const MOCK_ROOMS = [
  { id: '1', title: 'Yazılım Dünyasında Kariyer Fırsatları', participants: 178, isLive: true, topics: ['Kariyer', 'Yazılım'] },
  { id: '2', title: 'Müzik ve Teknoloji Kesişimi', participants: 93, isLive: true, topics: ['Müzik', 'Teknoloji'] },
  { id: '3', title: 'UX Tasarım Trendleri', participants: 124, isLive: true, topics: ['Tasarım', 'Teknoloji'] },
  { id: '4', title: 'Yapay Zeka ve Etik Tartışmaları', participants: 57, isLive: false, topics: ['Yapay Zeka', 'Teknoloji'] },
  { id: '5', title: 'Mobil Uygulama Geliştirme İpuçları', participants: 85, isLive: true, topics: ['Yazılım', 'Teknoloji'] }
];

const MOCK_USERS = [
  { id: '1', name: 'Ahmet Yılmaz', username: '@ahmetyilmaz', avatar: 'https://i.pravatar.cc/150?img=1', followers: 1248 },
  { id: '2', name: 'Ayşe Kaya', username: '@aysekaya', avatar: 'https://i.pravatar.cc/150?img=2', followers: 872 },
  { id: '3', name: 'Mehmet Demir', username: '@mehmetdemir', avatar: 'https://i.pravatar.cc/150?img=3', followers: 1536 },
  { id: '4', name: 'Zeynep Öztürk', username: '@zeynepozturk', avatar: 'https://i.pravatar.cc/150?img=4', followers: 954 },
  { id: '5', name: 'Can Yiğit', username: '@canyigit', avatar: 'https://i.pravatar.cc/150?img=5', followers: 682 }
];

const TRENDING_TOPICS = [
  'Teknoloji', 'Yapay Zeka', 'Girişimcilik', 'Flutter', 'React Native', 'iOS', 'Android', 'Web Geliştirme'
];

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

const UserItem = ({ user, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => onPress(user.id)}
    >
      <Image 
        source={{ uri: user.avatar }} 
        style={styles.userAvatar}
      />
      
      <View style={styles.userInfo}>
        <Typography.Body style={styles.userName}>{user.name}</Typography.Body>
        <Typography.Caption style={styles.userUsername}>{user.username}</Typography.Caption>
        <Typography.Caption>{user.followers} takipçi</Typography.Caption>
      </View>
      
      <TouchableOpacity style={styles.followButton}>
        <Typography.Caption style={styles.followButtonText}>Takip Et</Typography.Caption>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'people', 'topics'
  
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
              onPress={() => setSearchQuery(topic)}
            >
              <Typography.Body style={styles.trendingTopicText}>{topic}</Typography.Body>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const filteredRooms = MOCK_ROOMS.filter(room => 
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleRoomPress = (roomId) => {
    navigation.navigate('RoomScreen', { roomId });
  };
  
  const handleUserPress = (userId) => {
    navigation.navigate('ProfileScreen', { userId });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography.H2>Keşfet</Typography.H2>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sohbet odası, kişi veya konu ara..."
            placeholderTextColor={colors.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <View style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {searchQuery.length > 0 ? (
        <View style={styles.tabContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
              onPress={() => setActiveTab('rooms')}
            >
              <Typography.Body style={[
                styles.tabText, 
                activeTab === 'rooms' && styles.activeTabText
              ]}>
                Odalar
              </Typography.Body>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'people' && styles.activeTab]}
              onPress={() => setActiveTab('people')}
            >
              <Typography.Body style={[
                styles.tabText, 
                activeTab === 'people' && styles.activeTabText
              ]}>
                Kişiler
              </Typography.Body>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'rooms' ? (
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
        </View>
      ) : (
        renderEmptySearch()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48
  },
  searchIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.disabled,
    marginRight: 12
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16
  },
  clearButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.text.disabled
  },
  tabContainer: {
    flex: 1
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  },
  tabText: {
    color: colors.text.secondary
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600'
  },
  listContent: {
    padding: 16
  },
  roomCard: {
    backgroundColor: colors.background.medium,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden'
  },
  roomContent: {
    padding: 16
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  roomTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8
  },
  liveIndicator: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  liveText: {
    color: 'white',
    fontWeight: '700',
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
    backgroundColor: colors.background.light,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4
  },
  topicText: {
    color: colors.primary,
    fontSize: 10
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  userInfo: {
    flex: 1
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    padding: 16
  },
  sectionHeader: {
    marginBottom: 16
  },
  trendingTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  trendingTopicTag: {
    backgroundColor: colors.background.medium,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  },
  trendingTopicText: {
    fontWeight: '500'
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 24
  }
});

export default SearchScreen;