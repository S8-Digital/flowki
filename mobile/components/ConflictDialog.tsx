import { StyleSheet, useColorScheme, View } from 'react-native';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';

export interface ConflictOption {
  label: string;
  description?: string;
}

interface ConflictDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Title of the item that has a conflict */
  itemTitle: string;
  /** The local (device) version details */
  local: ConflictOption;
  /** The remote (server / RTDB) version details */
  remote: ConflictOption;
  /** Called when the user chooses to keep the local version */
  onKeepLocal: () => void;
  /** Called when the user chooses to accept the remote version */
  onKeepRemote: () => void;
  /** Called when the user dismisses without making a choice */
  onDismiss?: () => void;
}

/**
 * Simple conflict resolution dialog shown when local and remote versions
 * of a record differ after reconnecting.  The user picks which version to keep.
 */
export function ConflictDialog({
  visible,
  itemTitle,
  local,
  remote,
  onKeepLocal,
  onKeepRemote,
  onDismiss,
}: ConflictDialogProps) {
  const colorScheme = useColorScheme();
  const optionBackground =
    colorScheme === 'dark'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(0,0,0,0.05)';
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss ?? onKeepRemote}>
        <Dialog.Title>Sync Conflict</Dialog.Title>
        <Dialog.Content>
          <Paragraph style={styles.intro}>
            <ThemedText>
              {"Changes to "}
              <ThemedText variant="subtitle">{itemTitle}</ThemedText>
              {" conflict. Which version would you like to keep?"}
            </ThemedText>
          </Paragraph>
          <View style={styles.options}>
            <View style={[styles.option, { backgroundColor: optionBackground }]}>
              <ThemedText variant="subtitle">{local.label}</ThemedText>
              {local.description ? (
                <ThemedText variant="muted">{local.description}</ThemedText>
              ) : null}
            </View>
            <ThemedText style={styles.vs} variant="muted">
              vs
            </ThemedText>
            <View style={[styles.option, { backgroundColor: optionBackground }]}>
              <ThemedText variant="subtitle">{remote.label}</ThemedText>
              {remote.description ? (
                <ThemedText variant="muted">{remote.description}</ThemedText>
              ) : null}
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onKeepLocal}>Keep Mine</Button>
          <Button onPress={onKeepRemote} mode="contained">
            Use Latest
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: 12,
  },
  options: {
    gap: 8,
  },
  option: {
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  vs: {
    textAlign: 'center',
    fontSize: 12,
  },
});
