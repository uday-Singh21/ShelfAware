import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { 
  Appbar, 
  List, 
  Switch, 
  Divider,
  Portal,
  Dialog,
  Button,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

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
  // Comment out state for now
  const [pushEnabled, setPushEnabled] = useState(true);
  const [expiryThreshold, setExpiryThreshold] = useState(3);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('system');
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
      setShowSignOutDialog(false);
    }
  };

  const currentUser = auth()?.currentUser;
  const userEmail = currentUser ? currentUser.email : 'user@example.com';

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            right={() => (
              <Switch
                // value={pushEnabled}
                // onValueChange={setPushEnabled}
              />
            )}
          />
          <List.Item
            title="Expiry Alert Threshold"
            description={`Alert me {expiryThreshold} days before expiry`}
            onPress={() => {/* TODO: Add threshold picker */}}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
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
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Account</List.Subheader>
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
            titleStyle={{ color: colors.error }}
            onPress={() => setShowSignOutDialog(true)}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
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

      {/* Add Sign Out Dialog */}
      <Portal>
        <Dialog visible={showSignOutDialog} onDismiss={() => !loading && setShowSignOutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Dialog.Paragraph>
              Are you sure you want to sign out?
            </Dialog.Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setShowSignOutDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSignOut} 
              loading={loading}
              disabled={loading}
              textColor={colors.error}
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});

export default SettingsScreen; 