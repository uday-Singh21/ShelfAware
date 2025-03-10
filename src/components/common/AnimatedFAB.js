import React, {useState} from 'react';
import {View, TouchableOpacity, Animated, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../../constants/colors';

const AnimatedFAB = ({onScanPress, navigation}) => {
  const [animation] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => {
    const toValue = visible ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setVisible(!visible);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const button1TranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const button1TranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const button2TranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const button2TranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const handleButtonPress = callback => {
    if (typeof callback === 'function') {
      callback();
    }
    toggleMenu();
  };

  const handleAddPress = () => {
    navigation.navigate('Home', {
      screen: 'ProductInput',
      params: {
        isEditing: false,
      },
    });
    toggleMenu();
  };

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <Animated.View
        style={[
          styles.secondaryButton,
          {
            transform: [
              {translateX: button1TranslateX},
              {translateY: button1TranslateY},
            ],
            opacity: animation,
          },
        ]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress(onScanPress)}>
          <Icon name="barcode-scan" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Button */}
      <Animated.View
        style={[
          styles.secondaryButton,
          {
            transform: [
              {translateX: button2TranslateX},
              {translateY: button2TranslateY},
            ],
            opacity: animation,
          },
        ]}>
        <TouchableOpacity style={styles.button} onPress={handleAddPress}>
          <Icon name="pencil" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Button */}
      <TouchableOpacity
        style={styles.mainButtonContainer}
        onPress={toggleMenu}
        activeOpacity={0.7}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.mainButton}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Animated.View style={{transform: [{rotate: rotation}]}}>
            <Icon name="plus" size={28} color="white" />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 66,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 1,
  },
  mainButtonContainer: {
    width: 66,
    height: 66,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: colors.surface,
  },
  mainButton: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    position: 'absolute',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});

export default AnimatedFAB;
