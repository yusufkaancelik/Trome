// src/components/RoomCard.js
import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from './Typography';
import { ThemeContext } from '../context/ThemeContext';

const RoomCard = ({ room, onPress }) => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity 
      style={[styles.roomCard, { backgroundColor: theme.background.medium }]} 
      onPress={onPress}
    >
      <View style={styles.roomHeader}>
        {room.isLive && (
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: theme.error }]} />
            <Typography.Caption style={[styles.liveText, { color: theme.error }]}>CANLI</Typography.Caption>
          </View>
        )}
        {!room.isLive && room.scheduledFor && (
          <Typography.Caption style={[styles.scheduledText, { color: theme.primary }]}>
            {new Date(room.scheduledFor).toLocaleString('tr-TR', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography.Caption>
        )}
        <Typography.H3 style={{ color: theme.text.primary }} numberOfLines={2}>{room.title}</Typography.H3>
      </View>
      
      <View style={styles.hostContainer}>
        <View style={styles.avatarGroup}>
          {room.hosts.slice(0, 3).map((host, index) => (
            <Image 
              key={host.id}
              source={{ uri: host.avatar }} 
              style={[
                styles.hostAvatar,
                { 
                  marginLeft: index > 0 ? -10 : 0,
                  borderColor: theme.background.medium
                }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.hostInfo}>
          <Typography.Body style={[styles.hostNames, { color: theme.text.primary }]} numberOfLines={1}>
            {room.hosts.map(h => h.name).join(', ')}
          </Typography.Body>
          <Typography.Caption style={{ color: theme.text.secondary }}>
            {room.participants} dinleyici
          </Typography.Caption>
        </View>
      </View>
      
      <View style={styles.topicsContainer}>
        {room.topics.map(topic => (
          <View key={topic} style={[styles.topicTag, { backgroundColor: theme.background.light }]}>
            <Typography.Caption style={[styles.topicText, { color: theme.primary }]}>{topic}</Typography.Caption>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  roomHeader: {
    marginBottom: 12
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  liveText: {
    fontWeight: '700'
  },
  scheduledText: {
    marginBottom: 6
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: 12
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  hostInfo: {
    flex: 1
  },
  hostNames: {
    fontWeight: '500'
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  topicTag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4
  },
  topicText: {
    fontSize: 12
  }
});

export default RoomCard;