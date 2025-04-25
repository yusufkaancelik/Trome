// src/screens/Notifications/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  StatusBar
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';

// Simüle edilmiş bildirim verileri
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'new_follower',
    user: {
      id: '1',
      name: 'Ahmet Yılmaz',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    time: '2 saat önce',
    read: false
  },
  {
    id: '2',
    type: 'room_invite',
    user: {
      id: '3',
      name: 'Mehmet Demir',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    roomTitle: 'Müzik Sektöründe Yeni Trendler',
    time: '5 saat önce',
    read: false
  },
  {
    id: '3',
    type: 'room_started',
    user: {
      id: '4',
      name: 'Zeynep Öztürk',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    roomTitle: 'Girişimcilik Hikayeleri',
    time: '1 gün önce',
    read: true
  },
  {
    id: '4',
    type: 'mentioned',
    user: {
      id: '5',
      name: 'Can Yiğit',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    roomTitle: 'Teknoloji Dünyasındaki Son Gelişmeler',
    time: '1 gün önce',
    read: true
  },
  {
    id: '5',
    type: 'new_follower',
    user: {
      id: '6',
      name: 'Deniz Şahin',
      avatar: 'https://i.pravatar.cc/150?img=6'
    },
    time: '2 gün önce',
    read: true
  },
  {
    id: '6',
    type: 'room_invite',
    user: {
      id: '7',
      name: 'Berk Özkan',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    roomTitle: 'Film Önerileri ve Sinema Üzerine',
    time: '3 gün önce',
    read: true
  },
  {
    id: '7',
    type: 'system',
    title: 'Yeni Özellik: Programlanmış Odalar',
    message: 'Artık odaları önceden planlayabilir ve dinleyicilere haber verebilirsiniz.',
    time: '5 gün önce',
    read: true
  }
];

const NotificationItem = ({ notification, onPress }) => {
  let content;
  
  switch(notification.type) {
    case 'new_follower':
      content = (
        <Typography.Body numberOfLines={2} style={styles.notificationText}>
          <Typography.Body style={styles.userName}>{notification.user.name}</Typography.Body> seni takip etmeye başladı.
        </Typography.Body>
      );
      break;
    
    case 'room_invite':
      content = (
        <Typography.Body numberOfLines={2} style={styles.notificationText}>
          <Typography.Body style={styles.userName}>{notification.user.name}</Typography.Body> seni 
          <Typography.Body style={styles.highlight}> {notification.roomTitle}</Typography.Body> odasına davet etti.
        </Typography.Body>
      );
      break;
      
    case 'room_started':
      content = (
        <Typography.Body numberOfLines={2} style={styles.notificationText}>
          <Typography.Body style={styles.userName}>{notification.user.name}</Typography.Body> 
          <Typography.Body style={styles.highlight}> {notification.roomTitle}</Typography.Body> odasını başlattı.
        </Typography.Body>
      );
      break;
      
    case 'mentioned':
      content = (
        <Typography.Body numberOfLines={2} style={styles.notificationText}>
          <Typography.Body style={styles.userName}>{notification.user.name}</Typography.Body> senden 
          <Typography.Body style={styles.highlight}> {notification.roomTitle}</Typography.Body> odasında bahsetti.
        </Typography.Body>
      );
      break;
      
    case 'system':
      content = (
        <View>
          <Typography.Body style={[styles.notificationText, styles.systemTitle]}>
            {notification.title}
          </Typography.Body>
          <Typography.Caption style={styles.systemMessage}>
            {notification.message}
          </Typography.Caption>
        </View>
      );
      break;
  }
  
  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        !notification.read && styles.unreadNotification
      ]} 
      onPress={() => onPress(notification)}
    >
      {notification.type !== 'system' && (
        <Image source={{ uri: notification.user.avatar }} style={styles.userAvatar} />
      )}
      
      <View style={[
        styles.notificationContent,
        notification.type === 'system' && styles.systemNotificationContent
      ]}>
        {content}
        <Typography.Caption style={styles.timeText}>{notification.time}</Typography.Caption>
      </View>
      
      {!notification.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
};

const FilterChip = ({ label, selected, onPress }) => (
  <TouchableOpacity 
    style={[styles.filterChip, selected && styles.selectedFilterChip]}
    onPress={onPress}
  >
    <Typography.Caption 
      style={[styles.filterChipText, selected && styles.selectedFilterChipText]}
    >
      {label}
    </Typography.Caption>
  </TouchableOpacity>
);

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasUnread, setHasUnread] = useState(false);
  
  // Okunmamış bildirim kontrolü
  useEffect(() => {
    const unreadCount = notifications.filter(notif => !notif.read).length;
    setHasUnread(unreadCount > 0);
  }, [notifications]);
  
  // Bildirimleri filtreleme
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return notifications;
    } else if (activeFilter === 'unread') {
      return notifications.filter(notif => !notif.read);
    } else {
      return notifications.filter(notif => notif.type === activeFilter);
    }
  };
  
  const handleNotificationPress = (notification) => {
    // Bildirimi okundu olarak işaretleme
    if (!notification.read) {
      const updatedNotifications = notifications.map(notif => 
        notif.id === notification.id ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
    }
    
    // Bildirim tipine göre yönlendirme
    switch(notification.type) {
      case 'new_follower':
        navigation.navigate('ProfileScreen', { userId: notification.user.id });
        break;
      case 'room_invite':
      case 'room_started':
      case 'mentioned':
        // Burada ilgili odaya yönlendirme yapılabilir
        // navigation.navigate('RoomScreen', { roomId: ... });
        break;
    }
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
        >
        <Icon name="chevron-left" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        
        <Typography.H3>Bildirimler</Typography.H3>
        
        {hasUnread && (
          <TouchableOpacity 
            style={styles.readAllButton}
            onPress={markAllAsRead}
          >
            <Typography.Caption style={styles.readAllText}>
              Tümünü Okundu İşaretle
            </Typography.Caption>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filtersContainer}>
        <FlatList
          data={[
            { id: 'all', label: 'Tümü' },
            { id: 'unread', label: 'Okunmamış' },
            { id: 'new_follower', label: 'Takipçiler' },
            { id: 'room_invite', label: 'Davetler' },
            { id: 'room_started', label: 'Başlayan Odalar' },
          ]}
          renderItem={({ item }) => (
            <FilterChip 
              label={item.label}
              selected={activeFilter === item.id}
              onPress={() => setActiveFilter(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
      
      <FlatList
        data={getFilteredNotifications()}
        renderItem={({ item }) => (
          <NotificationItem 
            notification={item} 
            onPress={handleNotificationPress} 
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconPlaceholder} />
            <Typography.Body style={styles.emptyText}>
              {activeFilter === 'all' 
                ? 'Hiç bildiriminiz yok.' 
                : activeFilter === 'unread'
                  ? 'Okunmamış bildiriminiz yok.'
                  : 'Bu kategoride bildirim yok.'}
            </Typography.Body>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.secondary
  },
  readAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.background.light
  },
  readAllText: {
    color: colors.primary,
    fontWeight: '500'
  },
  filtersContainer: {
    marginBottom: 8
  },
  filtersContent: {
    paddingHorizontal: 20
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background.light,
    borderRadius: 20,
    marginRight: 8
  },
  selectedFilterChip: {
    backgroundColor: colors.primary
  },
  filterChipText: {
    color: colors.text.secondary
  },
  selectedFilterChipText: {
    color: colors.text.primary
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative'
  },
  unreadNotification: {
    backgroundColor: colors.background.light
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center'
  },
  systemNotificationContent: {
    paddingLeft: 12
  },
  notificationText: {
    color: colors.text.primary,
    marginBottom: 4
  },
  userName: {
    fontWeight: '600'
  },
  highlight: {
    fontWeight: '500',
    color: colors.primary
  },
  systemTitle: {
    fontWeight: '600',
    marginBottom: 4
  },
  systemMessage: {
    color: colors.text.secondary
  },
  timeText: {
    color: colors.text.disabled
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.light,
    marginBottom: 16
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center'
  }
});

export default NotificationsScreen;