import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { io } from 'socket.io-client';

// --- Configuration ---
// Replace with your computer's local IP address.
const SERVER_URL = 'http://192.168.0.102:3000'; 
const socket = io(SERVER_URL, {
  // Helps handle spotty connections by trying to reconnect automatically
  reconnection: true,
  reconnectionAttempts: 5,
});

// --- Interfaces ---
interface Message {
  id: string;
  text: string;
  sender?: string;   // Optional for system messages
  timestamp?: string; // Optional for system messages
  isSystem?: boolean; // Flag to identify system messages
}

// --- Main App Component ---
export default function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // --- Socket Event Listeners ---
    
    // Fired when history is received after joining
    socket.on('message history', (history: Message[]) => {
      // Reverse history to display correctly in an 'inverted' FlatList
      setMessages(history.slice().reverse());
    });

    // Fired when a new chat message arrives
    socket.on('chat message', (msg: Message) => {
      // Add new message to the top of the array
      setMessages((prevMessages) => [msg, ...prevMessages]);
    });

    // Fired when a system message (join/leave) arrives
    socket.on('system message', (msg: Message) => {
      setMessages((prevMessages) => [msg, ...prevMessages]);
    });

    // Fired with the list of users currently typing
    socket.on('typing users', (users: string[]) => {
      // Filter out our own username from the list
      setTypingUsers(users.filter((u) => u !== username));
    });

    // --- Cleanup ---
    // This function is called when the component unmounts
    return () => {
      socket.off('message history');
      socket.off('chat message');
      socket.off('system message');
      socket.off('typing users');
    };
  }, [username]); // Rerun effect if username changes

  const handleLogin = () => {
    if (username.trim().length < 3) {
      Alert.alert('Validation Error', 'Username must be at least 3 characters long.');
      return;
    }
    setLoggedIn(true);
    // Notify the server that this user has joined
    socket.emit('user joined', username);
  };

  const handleTyping = (text: string) => {
    setMessage(text);
    // Clear any existing timeout to reset the "stop typing" timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Notify the server that this user is typing
    socket.emit('typing', username);
    
    // Set a timeout to automatically notify that typing has stopped
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', username);
    }, 2000); // 2 seconds of inactivity
  };

  const sendMessage = () => {
    if (message.trim() === '') {
      return; // Prevent sending empty messages
    }

    const messageToSend = { text: message, sender: username };
    socket.emit('chat message', messageToSend);
    
    // Immediately notify that typing has stopped
    socket.emit('stop typing', username);
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }
    setMessage('');
  };

  // --- Render Functions ---

  const renderMessage = ({ item }: { item: Message }) => {
    // Render system messages with a distinct style
    if (item.isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    // Render user messages
    return (
      <View style={[ styles.bubble, item.sender === username ? styles.selfBubble : styles.otherBubble ]}>
        <Text style={styles.sender}>
          {item.sender} ({item.timestamp})
        </Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    const text = typingUsers.length === 1
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(', ')} are typing...`;
        
    return (
      <View style={styles.typingIndicatorContainer}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.typingIndicatorText}>{text}</Text>
      </View>
    );
  };

  // --- Component Views ---

  // Render the Login Screen if the user is not logged in
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginKeyboardAvoidingView}
        >
          <View style={styles.loginCard}>
            <Text style={styles.loginAppTitle}>ChatApp</Text>
            <Text style={styles.loginTitle}>Enter Your Username</Text>
            <TextInput
              style={styles.loginInput}
              placeholder="e.g., Jane Doe"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.loginButtonText}>Join Chat</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render the main Chat Screen if the user is logged in
  return (
    <SafeAreaView style={styles.container}>
       <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          inverted // This is key for making the list start at the bottom and auto-scroll
        />
        {renderTypingIndicator()}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            value={message}
            onChangeText={handleTyping}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
             <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
  },
  loginKeyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loginAppTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 25,
  },
  loginInput: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#DEDFEA',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#304FFE',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Chat Screen Styles
  container: {
    flex: 1,
    backgroundColor: '#1C2833', // A darker background for the chat
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  bubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '80%',
  },
  selfBubble: {
    backgroundColor: '#056162', // A color that fits the dark theme
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#262D31', // A dark grey for other users
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#EAEAEA', // Light text color
  },
  messageText: {
    fontSize: 16,
    color: '#EAEAEA', // Light text color
  },
  systemMessageContainer: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#9E9E9E', // A grey color for system text
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#182026',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 15,
    height: 40,
    backgroundColor: '#262D31',
    color: 'white',
  },
  sendButton: {
    backgroundColor: '#304FFE',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    height: 30,
    backgroundColor: '#182026',
  },
  typingIndicatorText: {
    marginLeft: 5,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});