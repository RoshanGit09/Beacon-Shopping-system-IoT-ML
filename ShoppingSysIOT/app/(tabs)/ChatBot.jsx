import { Image, StyleSheet, Platform, TextInput, FlatList, KeyboardAvoidingView, ScrollView, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import { useState, useEffect } from 'react';
import Markdown from 'react-native-markdown-display';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams  } from 'expo-router';

// Replace with your actual backend URL
const BACKEND_URL = 'http://192.168.116.123:5000';

import { useNavigation ,useRoute } from '@react-navigation/native';

export default function ChatBot() {
  const navigation = useNavigation();
  const route = useRoute(); 
  const { emailid } = route.params || {};
  
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: `Hello! How can I help you today, Roshan ${emailid}? 🤖`, 
      isBot: true 
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState('chat'); 

  const sendMessage = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${BACKEND_URL}/${currentEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: inputText,
        }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const userMessage = {
        id: Date.now().toString(),
        text: inputText,
        isBot: false,
      };
      
      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.main_response,
        isBot: true,
      };

      setMessages(prevMessages => [...prevMessages, userMessage, botMessage]);
      setInputText('');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        text: '❌ Sorry, I encountered an error. Please try again.',
        isBot: true,
        isError: true,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      await sendMessage();
    }
  };

  const handleQuickAction = (endpoint) => {
    setCurrentEndpoint(endpoint);
    setMessages([{ 
      id: '1', 
      text: `You are now in ${endpoint === 'chat' ? 'Nutrition' : 'Recipe'} mode. How can I assist you?`, 
      isBot: true 
    }]);
  };

  const renderMessage = ({ item }) => (
    <ThemedView
      style={[
        styles.messageContainer,
        item.isBot ? styles.botMessage : styles.userMessage,
        item.isError && styles.errorMessage,
      ]}
    >
      {item.isBot ? (
        <Markdown 
          style={markdownStyles(item.isError)}
        >
          {item.text}
        </Markdown>
      ) : (
        <ThemedText style={styles.userText}>
          {item.text}
        </ThemedText>
      )}
    </ThemedView>
  );

  return (
    <>
      
      {/* Quick Action Buttons */}
      <ThemedView style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            currentEndpoint === 'chat' && styles.quickActionButtonActive
          ]}
          onPress={() => handleQuickAction('chat')}
        >
          <ThemedText style={styles.quickActionButtonText}>Nutrition Value</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            currentEndpoint === 'recipe' && styles.quickActionButtonActive
          ]}
          onPress={() => handleQuickAction('recipe')}
        >
          <ThemedText style={styles.quickActionButtonText}>Recipe</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onScroll={() => Keyboard.dismiss()} 
        />
      </ThemedView>
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about nutrition or recipes..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          editable={!isLoading}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={!isLoading ? handleSend : undefined}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const markdownStyles = (isError) => ({
  body: {
    color: isError ? '#d32f2f' : '#000',
  },
  paragraph: {
    marginVertical: 0,
  },
  list: {
    marginVertical: 0,
  },
  listItem: {
    marginTop: 4,
  },
  bullet: {
    marginRight: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#7952b3',
    borderRadius: 8,
    marginRight: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  quickActionButton: {
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 16,
  },
  quickActionButtonActive: {
    backgroundColor: 'orange',
  },
  quickActionButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    gap: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f2f5',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7952b3',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
  },
  userText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    maxHeight: 100,
    borderWidth: 2,
    borderColor: '#7952b3',
  },
  sendButton: {
    backgroundColor: '#7952b3',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});