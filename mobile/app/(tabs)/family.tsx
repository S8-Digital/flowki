import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Family, FamilyMember } from '@/lib/api';
import { familyApi } from '@/lib/api';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  FAB,
  Portal,
  TextInput,
} from 'react-native-paper';

function MemberAvatar({ member }: { member: FamilyMember }) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar.Text
      size={36}
      label={initials}
      style={{ backgroundColor: member.profile_color ?? '#3B82F6' }}
    />
  );
}

function RoleChip({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin: '#EF4444',
    Member: '#3B82F6',
    Guest: '#6B7280',
    Child: '#8B5CF6',
  };
  return (
    <Chip compact style={{ backgroundColor: colors[role] ?? '#6B7280' }} textStyle={{ color: '#fff', fontSize: 11 }}>
      {role}
    </Chip>
  );
}

export default function FamilyScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { user, refreshUser } = useAuth();

  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user?.family_id) {
      setLoading(false);
      return;
    }
    try {
      const data = await familyApi.get();
      setFamily(data);
    } catch {
      // ignore — no family yet
    } finally {
      setLoading(false);
    }
  }, [user?.family_id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!familyName.trim()) return;
    setSaving(true);
    try {
      const data = await familyApi.create(familyName.trim());
      setFamily(data);
      await refreshUser();
      setCreateOpen(false);
      setFamilyName('');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not create family.');
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setSaving(true);
    try {
      const data = await familyApi.join(inviteCode.trim().toUpperCase());
      setFamily(data);
      await refreshUser();
      setJoinOpen(false);
      setInviteCode('');
    } catch (err: unknown) {
      Alert.alert('Invalid Code', err instanceof Error ? err.message : 'Could not join family.');
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = async () => {
    if (!family?.invite_code) return;
    await Clipboard.setStringAsync(family.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!family) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.noFamilyScroll}>
          <ThemedText variant="title" style={styles.heading}>
            No Family Yet
          </ThemedText>
          <ThemedText variant="muted" style={styles.subheading}>
            Create a new family or join an existing one with an invite code.
          </ThemedText>

          <Button
            mode="contained"
            onPress={() => setCreateOpen(true)}
            style={styles.btn}
          >
            Create a Family
          </Button>
          <Button
            mode="outlined"
            onPress={() => setJoinOpen(true)}
            style={styles.btn}
          >
            Join with Invite Code
          </Button>
        </ScrollView>

        {/* Create Dialog */}
        <Portal>
          <Dialog visible={createOpen} onDismiss={() => setCreateOpen(false)}>
            <Dialog.Title>Create a Family</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Family Name"
                value={familyName}
                onChangeText={setFamilyName}
                mode="outlined"
                placeholder="e.g. The Smith Family"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setCreateOpen(false)}>Cancel</Button>
              <Button onPress={handleCreate} loading={saving} disabled={saving || !familyName.trim()}>
                Create
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Join Dialog */}
          <Dialog visible={joinOpen} onDismiss={() => setJoinOpen(false)}>
            <Dialog.Title>Join a Family</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Invite Code"
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                mode="outlined"
                placeholder="e.g. ABCD1234"
                autoCapitalize="characters"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setJoinOpen(false)}>Cancel</Button>
              <Button onPress={handleJoin} loading={saving} disabled={saving || !inviteCode.trim()}>
                Join
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Family Name Card */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <ThemedText variant="subtitle">{family.name}</ThemedText>
            {family.location_name ? (
              <ThemedText variant="muted" style={{ marginTop: 4 }}>
                📍 {family.location_name}
              </ThemedText>
            ) : null}
          </Card.Content>
        </Card>

        {/* Invite Code Card */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <ThemedText variant="subtitle" style={{ marginBottom: 8 }}>
              Invite Code
            </ThemedText>
            <TouchableOpacity onPress={copyInviteCode} style={styles.inviteRow}>
              <ThemedText style={styles.inviteCode}>{family.invite_code}</ThemedText>
              <Chip compact onPress={copyInviteCode} icon={copied ? 'check' : 'content-copy'}>
                {copied ? 'Copied!' : 'Copy'}
              </Chip>
            </TouchableOpacity>
            <ThemedText variant="muted" style={{ marginTop: 8 }}>
              Share this code to invite people to your family.
            </ThemedText>
          </Card.Content>
        </Card>

        {/* Members Card */}
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <ThemedText variant="subtitle" style={{ marginBottom: 12 }}>
              Members ({family.members.length})
            </ThemedText>
            {family.members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <MemberAvatar member={member} />
                <View style={styles.memberInfo}>
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText variant="muted" style={styles.memberEmail}>
                    {member.email}
                  </ThemedText>
                </View>
                <RoleChip role={member.role} />
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },
  noFamilyScroll: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { textAlign: 'center', marginBottom: 8 },
  subheading: { textAlign: 'center', marginBottom: 32 },
  btn: { width: '100%', marginBottom: 12 },
  card: { marginBottom: 16, borderRadius: 12 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontWeight: '600' },
  memberEmail: { fontSize: 12 },
});
