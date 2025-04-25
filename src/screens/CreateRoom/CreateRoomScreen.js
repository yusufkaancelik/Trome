// src/screens/CreateRoom/CreateRoomScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components/Button';

const TOPICS = [
  'Teknoloji',
  'Yazılım',
  'Tasarım',
  'Yapay Zeka',
  'İş Dünyası',
  'Kariyer',
  'Sağlık',
  'Spor',
  'Müzik',
  'Sanat',
  'Eğitim',
  'Finans',
  'Kripto',
  'Oyun',
  'Seyahat'
];

const CreateRoomScreen = ({ navigation }) => {
  const [roomTitle, setRoomTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isRecordEnabled, setIsRecordEnabled] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      if (selectedTopics.length < 3) {
        setSelectedTopics([...selectedTopics, topic]);
      }
    }
  };
  
  const handleCreateRoom = () => {
    if (roomTitle.trim().length === 0) {
      // Oda başlığı boş olamaz hata mesajı göster
      return;
    }
    
    const newRoom = {
      id: Date.now().toString(),
      title: roomTitle,
      topics: selectedTopics,
      isPrivate,
      isRecordEnabled,
      createdAt: new Date()
    };
    
    // Oda oluşturulduğunda RoomScreen'e yönlendir
    navigation.navigate('RoomScreen', { roomId: newRoom.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Typography.H3>Yeni Oda Oluştur</Typography.H3>
        
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Typography.Body style={styles.inputLabel}>Oda Başlığı</Typography.Body>
          <TextInput
            style={styles.input}
            placeholder="Odanız için çekici bir başlık yazın..."
            placeholderTextColor={colors.text.disabled}
            value={roomTitle}
            onChangeText={setRoomTitle}
            maxLength={60}
          />
          <Typography.Caption style={styles.characterCount}>
            {roomTitle.length}/60
          </Typography.Caption>
        </View>
        
        <View style={styles.formGroup}>
          <Typography.Body style={styles.inputLabel}>Konular (En fazla 3)</Typography.Body>
          <View style={styles.topicsContainer}>
            {TOPICS.map(topic => (
              <TouchableOpacity 
                key={topic}
                style={[
                  styles.topicTag,
                  selectedTopics.includes(topic) && styles.topicTagSelected
                ]}
                onPress={() => toggleTopic(topic)}
              >
                <Typography.Caption 
                  style={[
                    styles.topicText,
                    selectedTopics.includes(topic) && styles.topicTextSelected
                  ]}
                >
                  {topic}
                </Typography.Caption>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Typography.Body style={styles.inputLabel}>Oda Ayarları</Typography.Body>
          
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View>
                <Typography.Body>Özel Oda</Typography.Body>
                <Typography.Caption style={styles.settingDescription}>
                  Sadece davet ettiğiniz kişiler katılabilir
                </Typography.Caption>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: colors.background.light, true: colors.primary }}
                thumbColor={colors.text.primary}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <View>
                <Typography.Body>Kayıt</Typography.Body>
                <Typography.Caption style={styles.settingDescription}>
                  Konuşma daha sonra dinlenebilir
                </Typography.Caption>
              </View>
              <Switch
                value={isRecordEnabled}
                onValueChange={setIsRecordEnabled}
                trackColor={{ false: colors.background.light, true: colors.primary }}
                thumbColor={colors.text.primary}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Oda Oluştur"
          onPress={handleCreateRoom}
          style={styles.createButton}
          disabled={roomTitle.trim().length === 0 || selectedTopics.length === 0}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.disabled
  },
  content: {
    padding: 16
  },
  formGroup: {
    marginBottom: 24
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
    color: colors.text.secondary
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  topicTag: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  },
  topicTagSelected: {
    backgroundColor: colors.primary
  },
  topicText: {
    color: colors.text.primary
  },
  topicTextSelected: {
    color: 'white',
    fontWeight: '600'
  },
  settingsContainer: {
    backgroundColor: colors.background.medium,
    borderRadius: 16,
    overflow: 'hidden'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  settingDescription: {
    color: colors.text.secondary,
    marginTop: 4
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.background.light
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.background.light
  },
  createButton: {
    height: 50
  }
});

export default CreateRoomScreen;