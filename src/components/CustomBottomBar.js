import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from "../constants/COLORS";

const CustomBottomBar = ({ navigation, activeTab }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Upload')}
      >
        <Icon name="cloud-upload-outline" size={24} color={activeTab === 'Upload' ? COLORS.MAROON : 'gray'} />
        <Text style={{ color: activeTab === 'Upload' ? COLORS.MAROON : 'gray' }}>Upload</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Modules')}
      >
        <Icon name="book-outline" size={24} color={activeTab === 'Modules' ? COLORS.MAROON : 'gray'} />
        <Text style={{ color: activeTab === 'Modules' ? COLORS.MAROON : 'gray' }}>Modules</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Profile')}
      >
        <Icon name="person-outline" size={24} color={activeTab === 'Profile' ? COLORS.MAROON : 'gray'} />
        <Text style={{ color: activeTab === 'Profile' ? COLORS.MAROON : 'gray' }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width, // Full width
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  iconContainer: {
    alignItems: 'center',
  },
});

export default CustomBottomBar;
