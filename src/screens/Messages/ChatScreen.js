import React, { useState, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// colors.js'den alınan dark theme renkleri
const colors = {
  primary: '#6C63FF',
  background: {
    dark: '#121212',
    medium: '#1E1E1E',
    light: '#2D2D2D'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B'
  }
};

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: 'Merhaba! Nasılsın?', 
      isMe: false, 
      time: '11:30' 
    },
    { 
      id: '2', 
      text: 'İyiyim, teşekkür ederim. Sen nasılsın?', 
      isMe: true, 
      time: '11:31' 
    },
    { 
      id: '3', 
      text: 'Ben de iyiyim. Proje sunumuna hazırlandın mı?', 
      isMe: false, 
      time: '11:35'
    },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: newMessage,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.dark }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
      
      {/* Üst Bar */}
      <View style={[styles.topBar, { 
        backgroundColor: colors.background.medium,
        borderBottomColor: colors.background.light
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.primary }]}>Mert Gündüz</Text>
        <View style={styles.emptyView}></View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Mesajlar */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer, 
              item.isMe ? styles.myMessage : styles.otherMessage,
              item.isMe ? 
                { backgroundColor: colors.primary } : 
                { backgroundColor: colors.background.light }
            ]}>
              <Text style={[
                styles.messageText,
                item.isMe ? 
                  { color: colors.text.primary } : 
                  { color: colors.text.primary }
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.timeText,
                item.isMe ? 
                  { color: 'rgba(255,255,255,0.7)' } : 
                  { color: colors.text.secondary }
              ]}>
                {item.time}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
        />
        
        {/* Mesaj Yazma Alanı */}
        <View style={[styles.inputContainer, { 
          backgroundColor: colors.background.medium,
          borderTopColor: colors.background.light
        }]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background.light,
              color: colors.text.primary,
              borderColor: colors.background.light
            }]}
            placeholder="Mesaj yaz..."
            placeholderTextColor={colors.text.disabled}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              { 
                backgroundColor: newMessage.trim() ? colors.primary : colors.background.light 
              }
            ]} 
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={newMessage.trim() ? "white" : colors.text.disabled} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyView: {
    width: 24,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 70,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;