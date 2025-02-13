import { Image, StyleSheet, ScrollView, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const features = [
    "Discover trending products tailored to your interests",
    "Get smart recommendations based on your shopping habits",
    "Track your orders in real-time with live updates",
    "Save your favorite items for later purchase",
    "Enjoy exclusive deals and personalized discounts"
  ];

  return (
    <ThemedView style={styles.container}>

      <Image
        source={require('../../assets/images/react-logo.png')}
        style={styles.image}
        resizeMode="contain"></Image>
      <ThemedText style={styles.title}>Welcome to Beacon Shopping System</ThemedText>
      <ThemedText style={styles.subtitle}>Your personalized shopping assistant</ThemedText>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.featuresBox}>
          <ThemedText style={styles.featuresTitle}>What we offer</ThemedText>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.bullet} />
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    marginTop: 50,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 20,
  },
  featuresBox: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    lineHeight: 22,
  },
});