// src/screens/AllRooms/AllRoomsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import RoomCard from '../../components/RoomCard'; // Import the RoomCard component

// Ana ekrandaki aynı mock verileri kullanabilirsiniz
import { MOCK_ROOMS } from '../../Data/mockData'; // veya veriyi doğrudan ekleyebilirsiniz

const AllRoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [filter, setFilter] = useState('all'); // 'all', 'live', 'scheduled'
  
  // Filtreleme işlemi
  useEffect(() => {
    let filteredRooms = [...MOCK_ROOMS];
    
    if (filter === 'live') {
      filteredRooms = filteredRooms.filter(room => room.isLive);
    } else if (filter === 'scheduled') {
      filteredRooms = filteredRooms.filter(room => !room.isLive && room.scheduledFor);
    }
    
    setRooms(filteredRooms);
  }, [filter]);

  const handleRoomPress = (room) => {
    navigation.navigate('RoomScreen', { roomId: room.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Typography.H2>Tüm Odalar</Typography.H2>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Typography.Body style={filter === 'all' ? styles.activeFilterText : {}}>
            Tümü
          </Typography.Body>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'live' && styles.activeFilter]}
          onPress={() => setFilter('live')}
        >
          <Typography.Body style={filter === 'live' ? styles.activeFilterText : {}}>
            Canlı
          </Typography.Body>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'scheduled' && styles.activeFilter]}
          onPress={() => setFilter('scheduled')}
        >
          <Typography.Body style={filter === 'scheduled' ? styles.activeFilterText : {}}>
            Planlanan
          </Typography.Body>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={rooms}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={() => handleRoomPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.roomsList}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.background.light
  },
  activeFilter: {
    backgroundColor: colors.primary
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600'
  },
  roomsList: {
    paddingHorizontal: 20
  }
});

export default AllRoomsScreen;