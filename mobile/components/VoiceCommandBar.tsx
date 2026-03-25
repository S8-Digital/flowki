/**
 * VoiceCommandBar
 *
 * A card-based text input that sends natural-language commands to the
 * `/api/mobile/voice/command` endpoint. Users can type a command, use the
 * keyboard's built-in dictation microphone, or trigger it via Siri Shortcuts
 * ("Hey Siri, add milk to my Flowki shopping list"). The AI agent's response
 * is shown inline beneath the input.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { voiceApi } from '@/lib/api';

interface VoiceCommandBarProps {
  /** Called after a successful command so callers can refresh data if needed. */
  onSuccess?: (response: string) => void;
}

export function VoiceCommandBar({ onSuccess }: VoiceCommandBarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null);

  const send = async () => {
    const trimmed = command.trim();

    if (!trimmed) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await voiceApi.sendCommand(trimmed);

      if (res && res.success) {
        setResult({ text: res.response, error: false });
        setCommand('');
        onSuccess?.(res.response);
      }
    } catch (err: unknown) {
      // ApiError (from the api helper) attaches the parsed JSON body as `data`.
      // The backend voice endpoint puts its human-readable message in `data.response`.
      const data =
        err != null && typeof err === 'object' && 'data' in err
          ? (err as { data: Record<string, unknown> }).data
          : undefined;
      const message =
        (typeof data?.response === 'string' ? data.response : undefined) ??
        (err instanceof Error ? err.message : 'Could not connect to the server.');
      setResult({ text: message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]} testID="voice-command-bar">
      <Card.Content>
        <ThemedText variant="subtitle" style={styles.label}>
          🎙️ Voice Command
        </ThemedText>
        <ThemedText variant="muted" style={styles.hint}>
          Type a command or use your keyboard's mic
        </ThemedText>
        <View style={styles.row}>
          <TextInput
            testID="voice-command-input"
            mode="outlined"
            placeholder='e.g. "Add milk to shopping list"'
            value={command}
            onChangeText={setCommand}
            style={styles.input}
            onSubmitEditing={send}
            returnKeyType="send"
            editable={!loading}
          />
          <Button
            testID="voice-command-send"
            mode="contained"
            onPress={send}
            disabled={loading || !command.trim()}
            style={[styles.sendBtn, { backgroundColor: colors.tint }]}
            labelStyle={{ color: '#fff' }}
          >
            Send
          </Button>
        </View>
        {loading && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" />
            <ThemedText variant="muted" style={styles.statusText}>
              Processing…
            </ThemedText>
          </View>
        )}
        {result && (
          <ThemedText
            testID="voice-command-result"
            style={[styles.result, { color: result.error ? colors.destructive : colors.text }]}
          >
            {result.text}
          </ThemedText>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, borderRadius: 12 },
  label: { marginBottom: 2 },
  hint: { fontSize: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, fontSize: 14 },
  sendBtn: { marginLeft: 4, alignSelf: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  statusText: { fontSize: 13 },
  result: { marginTop: 10, fontSize: 14, lineHeight: 20 },
});
