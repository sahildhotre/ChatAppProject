import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { io, Socket } from 'socket.io-client';

// ✅ Replace this with your current IPv4 address and port
const socket: Socket = io('http://192.168.0.102:3000');

export default function App() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat message', (msg: string) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    // Clean up on unmount
    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 5,
    height: 40,
  },
  message: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
    borderRadius: 5,
  },
});
