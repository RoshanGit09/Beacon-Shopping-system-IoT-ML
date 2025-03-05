import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { User, Calendar, Cake, Heart, AlertCircle } from 'lucide-react-native';

export default function PersonalDetailsScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [favoriteFoods, setFavoriteFoods] = useState('');
  const [married, setMarried] = useState(false);
  const [children, setChildren] = useState('0');
  const [allergicFoods, setAllergicFoods] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !age || !gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch('http://192.168.116.123:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          age: parseInt(age),
          gender,
          favorite_foods: favoriteFoods.split(',').map(food => food.trim()),
          married,
          children: parseInt(children),
          allergic_foods: allergicFoods.split(',').map(food => food.trim()),
          medical_conditions: medicalConditions.split(',').map(condition => condition.trim())
        })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      router.push({
        pathname: '/(tabs)/home',
        params: { email }
      });
    } catch (error) {
      console.error('Error submitting form data:', error);
      Alert.alert('Submission Failed', 'Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Customer Information</Text>
        <Text style={styles.subtitle}>Help us serve you better</Text>

        <View style={styles.inputContainer}>
          <User size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Calendar size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Age *"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <User size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Gender *"
            value={gender}
            onChangeText={setGender}
          />
        </View>

        <View style={styles.inputContainer}>
          <Cake size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Favorite Foods (comma separated)"
            value={favoriteFoods}
            onChangeText={setFavoriteFoods}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Married:</Text>
          <Switch
            value={married}
            onValueChange={setMarried}
            trackColor={{ false: "#767577", true: "#4A66F4" }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Heart size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Number of Children"
            value={children}
            onChangeText={setChildren}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <AlertCircle size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Allergic Foods (comma separated)"
            value={allergicFoods}
            onChangeText={setAllergicFoods}
          />
        </View>

        <View style={styles.inputContainer}>
          <AlertCircle size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Medical Conditions (comma separated)"
            value={medicalConditions}
            onChangeText={setMedicalConditions}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4A66F4',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});