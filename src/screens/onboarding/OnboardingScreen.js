import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { onboardingImages } from '../../constants/images';
import { fonts } from '../../constants/fonts';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    title: 'Welcome to ShelfAware',
    description:
      'Easily track product expiry dates and stay ahead with timely reminders.',
    image: onboardingImages.image1,
  },
  {
    title: 'Smart Scanning',
    description:
      'Scan barcodes or use OCR to extract expiry dates instantly and keep your inventory updated.',
    image: onboardingImages.image2,
  },
  {
    title: "Let's Get Started",
    description:
      'Start organizing your products and receive smart alerts before they expire!',
    image: onboardingImages.image3,
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const carouselRef = useRef(null);
  const progressValue = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const onSkip = () => {
    const lastIndex = ONBOARDING_DATA.length - 1;
    carouselRef.current?.scrollTo({index: lastIndex});
    setCurrentIndex(lastIndex); // Immediately update the index for UI sync
  };

  const onNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      carouselRef.current?.scrollTo({index: nextIndex});
      setCurrentIndex(nextIndex); // Immediately update the index for UI sync
    } else {
      await markOnboardingComplete();
      navigation.replace('SignIn');
    }
  };

  const onSnapToItem = (index) => {
    setCurrentIndex(index);
    progressValue.value = index;
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.slideContainer}>
        <View style={styles.contentContainer}>
          <Image source={item.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderButtons = () => {
    if (currentIndex === 0) {
      return (
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      );
    }
    return <View style={{width: 80}} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SCREEN_WIDTH}
        height={SCREEN_WIDTH * 1.6}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
        }}
        onSnapToItem={onSnapToItem}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        enabled={true}
        autoPlay={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: currentIndex === index ? 20 : 8,
                  opacity: currentIndex === index ? 1 : 0.5,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {renderButtons()}
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={onNext}>
            <Text style={styles.nextText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    margin: 20,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.card,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.background,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.background,
  },
  skipText: {
    fontSize: 16,
    color: colors.background,
    fontFamily: fonts.semiBold,
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: colors.background,
  },
  nextText: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
});

export default OnboardingScreen;