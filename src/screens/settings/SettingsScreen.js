import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Appbar, List, Switch, Divider, Button, Dialog, RadioButton, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { signOut } from '../../services/auth';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
];

const THEMES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [expiryThreshold, setExpiryThreshold] = useState(3);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currentUser = auth()?.currentUser;
  const userEmail = currentUser ? currentUser.email : 'user@example.com';

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: tabBarHeight }}>
        <List.Section>
          <List.Subheader style={styles.sectionTitle}>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            right={() => (
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
              />
            )}
          />
        
        </List.Section>

        <Divider />

        {/* <List.Section>
          <List.Subheader style={styles.sectionTitle}>Appearance</List.Subheader>
          <List.Item
            title="Language"
            // description={LANGUAGES.find(l => l.value === language)?.label}
            onPress={() => setShowLanguageDialog(true)}
          />
          <List.Item
            title="Theme"
            // description={THEMES.find(t => t.value === theme)?.label}
            onPress={() => setShowThemeDialog(true)}
          />
        </List.Section> */}

        <Divider />

        <List.Section>
          <List.Subheader style={styles.sectionTitle}>Account</List.Subheader>
          <List.Item
            title="Email"
            description={userEmail}
            left={props => <Icon {...props} name="email-outline" size={24} />}
          />
          <List.Item
            title="Change Password"
            left={props => <Icon {...props} name="lock-outline" size={24} />}
            onPress={() => {/* TODO: Add password change functionality */}}
          />
          <List.Item
            title="Sign Out"
            left={props => <Icon {...props} name="logout-variant" size={24} color={colors.error} />}
            titleStyle={styles.signOutText}
            onPress={handleSignOut}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={styles.sectionTitle}>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <Icon {...props} name="information-outline" size={24} />}
          />
          <List.Item
            title="Privacy Policy"
            left={props => <Icon {...props} name="shield-outline" size={24} />}
            onPress={() => {/* TODO: Add privacy policy link */}}
          />
          <List.Item
            title="Help"
            left={props => <Icon {...props} name="help-circle-outline" size={24} />}
          />
        </List.Section>
      </ScrollView>

      {/* Language Selection Dialog */}
      <Portal>
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setLanguage(value)} value={language}>
              {LANGUAGES.map(lang => (
                <RadioButton.Item
                  key={lang.value}
                  label={lang.label}
                  value={lang.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Theme Selection Dialog */}
      <Portal>
        <Dialog visible={showThemeDialog} onDismiss={() => setShowThemeDialog(false)}>
          <Dialog.Title>Select Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setTheme(value)} value={theme}>
              {THEMES.map(themeOption => (
                <RadioButton.Item
                  key={themeOption.value}
                  label={themeOption.label}
                  value={themeOption.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowThemeDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  listItem: {
    fontFamily: fonts.regular,
  },
  listItemDescription: {
    fontFamily: fonts.regular,
    color: colors.disabled,
  },
  signOutText: {
    fontFamily: fonts.medium,
    color: colors.error,
  },
});

export default SettingsScreen; 