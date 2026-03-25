import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  List,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { profileApi } from '@/lib/api';

const PROFILE_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <View style={styles.colorRow}>
      {PROFILE_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onChange(c)}
          style={[
            styles.colorSwatch,
            { backgroundColor: c },
            value === c && styles.colorSwatchSelected,
          ]}
        />
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user, logout, refreshUser } = useAuth();

  // Profile section
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(user?.email ?? '');
  const [profileColor, setProfileColor] = useState(user?.profile_color ?? '#3B82F6');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password section
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Inbound email copy
  const [inboundCopied, setInboundCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileColor(user.profile_color ?? '#3B82F6');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      Alert.alert('Error', 'Name and email are required.');

      return;
    }

    setProfileSaving(true);

    try {
      await profileApi.update({
        name: profileName.trim(),
        email: profileEmail.trim(),
        profile_color: profileColor,
      });
      await refreshUser();
      setProfileOpen(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');

      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');

      return;
    }

    setPasswordSaving(true);

    try {
      await profileApi.updatePassword(
        currentPassword || undefined,
        newPassword,
        confirmPassword,
      );
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Saved', 'Password updated successfully.');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleCopyInboundEmail = async () => {
    if (!user?.inbound_email_address) return;
    await Clipboard.setStringAsync(user.inbound_email_address);
    setInboundCopied(true);
    setTimeout(() => setInboundCopied(false), 2000);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: user?.profile_color ?? '#3B82F6' },
            ]}
          >
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
          <ThemedText variant="subtitle" style={styles.userName}>
            {user?.name}
          </ThemedText>
          <ThemedText variant="muted">{user?.email}</ThemedText>
        </View>

        {/* Account Section */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <List.Item
            title="Edit Profile"
            description="Name, email and colour"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setProfileOpen(true)}
          />
          <Divider />
          <List.Item
            title="Change Password"
            description="Update your password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setPasswordOpen(true)}
          />
        </Card>

        {/* Inbound Email */}
        {user?.inbound_email_address && (
          <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <List.Item
              title="Inbound email address"
              description="Forward emails here to auto-create family organiser items via AI"
              left={(props) => <List.Icon {...props} icon="email-arrow-left" />}
            />
            <Divider />
            <View style={styles.inboundEmailRow}>
              <ThemedText variant="muted" style={styles.inboundEmailText} numberOfLines={1}>
                {user.inbound_email_address}
              </ThemedText>
              <Button
                mode="outlined"
                compact
                onPress={handleCopyInboundEmail}
                testID="copy-inbound-email"
              >
                {inboundCopied ? 'Copied!' : 'Copy'}
              </Button>
            </View>
          </Card>
        )}

        {/* Danger Zone */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <List.Item
            title="Log Out"
            titleStyle={{ color: '#EF4444' }}
            left={(props) => <List.Icon {...props} icon="logout" color="#EF4444" />}
            onPress={handleLogout}
          />
        </Card>
      </ScrollView>

      <Portal>
        {/* Edit Profile Dialog */}
        <Dialog visible={profileOpen} onDismiss={() => setProfileOpen(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView>
              <View style={{ padding: 16, gap: 12 }}>
                <TextInput
                  label="Name"
                  value={profileName}
                  onChangeText={setProfileName}
                  mode="outlined"
                />
                <TextInput
                  label="Email"
                  value={profileEmail}
                  onChangeText={setProfileEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <ThemedText variant="muted" style={{ marginTop: 4 }}>
                  Profile colour
                </ThemedText>
                <ColorPicker value={profileColor} onChange={setProfileColor} />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setProfileOpen(false)}>Cancel</Button>
            <Button
              onPress={handleSaveProfile}
              loading={profileSaving}
              disabled={profileSaving}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog visible={passwordOpen} onDismiss={() => setPasswordOpen(false)}>
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content style={{ gap: 12 }}>
            <TextInput
              label="Current Password (if set)"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordOpen(false)}>Cancel</Button>
            <Button
              onPress={handleChangePassword}
              loading={passwordSaving}
              disabled={passwordSaving}
            >
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: '#fff' },
  userName: { marginBottom: 2 },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  inboundEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  inboundEmailText: {
    flex: 1,
    fontSize: 13,
  },
});
