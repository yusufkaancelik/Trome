// AvatarSelectorModal.js
import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { colors } from '../../theme/colors';
import { Typography } from '../../components/Typography';
import Icon from 'react-native-vector-icons/Feather';
import { avatars } from '../../Data/avatars';

const AvatarSelectorModal = ({ visible, onClose, onSelectAvatar, selectedAvatar }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Typography.H2>Avatar Seç</Typography.H2>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={avatars}
            numColumns={3}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.avatarItem,
                  selectedAvatar === item.url && styles.selectedAvatarItem
                ]}
                onPress={() => onSelectAvatar(item)}
              >
                <Image source={{ uri: item.url }} style={styles.avatarImage} />
                {selectedAvatar === item.url && (
                  <View style={styles.selectedOverlay}>
                    <Icon name="check" size={24} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.gridContainer}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  gridContainer: {
    paddingBottom: 24,
  },
  avatarItem: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarItem: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default AvatarSelectorModal;