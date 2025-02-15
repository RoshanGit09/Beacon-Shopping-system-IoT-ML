import { Image, StyleSheet, Platform, TextInput, FlatList, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import Markdown from 'react-native-markdown-display';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Replace with your actual backend URL
const BACKEND_URL = 'http://localhost:5000';

export default function TabTwoScreen() {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: 'Hello! How can I help you today? You can ask me about:\n\n- Nutritional information\n- Recipe ingredients', 
      isBot: true 
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (endpoint) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_prompt: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add user message
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
      const isRecipeQuery = inputText.toLowerCase().includes('recipe') || 
                           inputText.toLowerCase().includes('ingredients') ||
                           inputText.toLowerCase().includes('how to make');
      
      await sendMessage(isRecipeQuery ? 'recipe' : 'chat');
    }
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.title}>DigiSupermart Assistant</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.chatContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
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
        <ThemedView 
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onTouchEnd={!isLoading ? handleSend : undefined}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
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
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
  title: {
    marginTop: 50, // Adjusted margin to move the title down
    fontSize: 24,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    gap: 8,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3e3e3',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
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
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
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
