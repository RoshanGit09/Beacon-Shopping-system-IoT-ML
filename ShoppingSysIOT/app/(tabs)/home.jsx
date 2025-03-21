import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, ImageBackground, StatusBar } from 'react-native';
import { Header, Card, ListItem, Badge } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
const auth = getAuth();
import { router } from 'expo-router';
import axios from 'axios';

const Home = () => {
  const navigation = useNavigation();
  const { email } = useLocalSearchParams();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [pexelsImage, setPexelsImage] = useState(null);
  const [productImages, setProductImages] = useState({}); 

  const mockProducts = [
    { id: 1, name: 'Apple', price: 199, image: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Banana', price: 99, image: 'https://via.placeholder.com/150' },
    { id: 3, name: 'Orange', price: 150, image: 'https://via.placeholder.com/150' },
    { id: 4, name: 'Carrot', price: 49, image: 'https://via.placeholder.com/150' },
    { id: 5, name: 'Tomato', price: 29, image: 'https://via.placeholder.com/150' },
    { id: 6, name: 'Potato', price: 45, image: 'https://via.placeholder.com/150' },
  ];

  const fetchLivePrices = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setProductLoading(false);
    } catch (err) {
      console.error("Error fetching live prices:", err);
      setProductLoading(false);
    }
  };

  const fetchPexelsImage = async (query) => {
  
      const response = await axios.get(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
        headers: {
          Authorization: 'zQpKOsVmDDxuC49sTeNNhD3IbNxU6JrELBIVhg8dPFZcMVb5pMKnN44g',
        },
      });
      if (response.data.photos.length > 0) {
        return response.data.photos[0].src.medium; 
      }
    
    return null;
  };

  const fetchProductImages = async () => {
    const images = {};
    for (const product of mockProducts) {
      const imageUrl = await fetchPexelsImage(product.name);
      if (imageUrl) {
        images[product.id] = imageUrl;
      }
    }
    setProductImages(images);
  };

  useEffect(() => {
    fetchLivePrices();
    fetchProductImages();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchPexelsImage(selectedProduct.value).then((imageUrl) => {
        setPexelsImage(imageUrl);
      });
    }
  }, [selectedProduct]);

  const handleLogout = async () => {
    try {
      await fetch('http://192.168.116.123:8080/clear_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      await signOut(auth);
      setIsLoggedIn(false);
      clearInterval(intervalId);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const fetchData = async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const response = await fetch(`http://192.168.116.123:8080/get_device?email=${email}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDeviceData(data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch BLE device data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  let intervalId;

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      intervalId = setInterval(fetchData, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  const renderDeviceData = () => {
    if (!isLoggedIn) return null;
    if (loading && !deviceData) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.statusText}>Scanning for BLE devices...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!deviceData) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>No BLE devices found</Text>
        </View>
      );
    }

    return (
      <Card containerStyle={styles.deviceCard}>
        <ScrollView style={styles.container}>
          <View>
            <Text style={styles.productDetailsTitle}>Product Details:</Text>
            {deviceData.product_info && Object.entries(deviceData.product_info)
              .filter(([key]) => key !== 'error')
              .sort(([keyA], [keyB]) => keyA === 'RACK' ? -1 : keyB === 'RACK' ? 1 : 0)
              .map(([key, value], index) => (
                key === 'RACK' ? (
                  <Text key={index} style={styles.sectionTitle}>{value}</Text>
                ) : (
                  <TouchableOpacity key={index} onPress={() => {
                    setSelectedProduct({ key, value });
                    setIsModalVisible(true);
                  }}>
                    <ListItem bottomDivider containerStyle={styles.listItem}>
                      <ListItem.Content>
                        <ListItem.Title style={styles.listItemTitle}>{value}</ListItem.Title>
                        <ListItem.Subtitle style={styles.listItemSubtitle}>{key}</ListItem.Subtitle>
                      </ListItem.Content>
                      <Icon name="chevron-right" size={20} color="#6C63FF" />
                    </ListItem>
                  </TouchableOpacity>
                )
              ))}
          </View>

          {deviceData.analyzed_products && deviceData.analyzed_products.sorted_products && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisSubtitle}>Products sorted by recommendation for you:</Text>

              {deviceData.analyzed_products.sorted_products.map((product, index) => (
                <ListItem key={index} bottomDivider containerStyle={styles.analysisItem}>
                  <Icon
                    name={
                      product.recommendation === 'recommended' ? 'check-circle' :
                        product.recommendation === 'highly recommended' ? 'star' :
                          product.recommendation === 'consume with caution' ? 'exclamation-circle' :
                            'times-circle'
                    }
                    type="material-community"
                    color={
                      product.recommendation === 'recommended' ? 'green' :
                        product.recommendation === 'highly recommended' ? '#3498db' :
                          product.recommendation === 'consume with caution' ? '#f39c12' :
                            '#e74c3c'
                    }
                    size={24}
                  />
                  <ListItem.Content>
                    <View style={styles.productHeader}>
                      <ListItem.Title style={styles.productName}>{product.name}</ListItem.Title>
                      <Badge
                        value={product.recommendation}
                        status={
                          product.recommendation === 'recommended' ? 'success' :
                            product.recommendation === 'highly recommended' ? 'primary' :
                              product.recommendation === 'consume with caution' ? 'warning' :
                                'error'
                        }
                      />
                    </View>
                    <ListItem.Subtitle style={styles.reasonText}>{product.reason}</ListItem.Subtitle>

                    {product.warning && (
                      <View style={styles.warningContainer}>
                        <Icon name="warning" type="material" color="#f39c12" size={16} />
                        <Text style={styles.warningText}>{product.warning}</Text>
                      </View>
                    )}
                  </ListItem.Content>
                </ListItem>
              ))}
            </View>
          )}

          {!deviceData.analyzed_products && (
            <View style={styles.noAnalysisContainer}>
              <Text style={styles.noAnalysisText}>
                Health analysis not available. Please provide your user ID to see personalized recommendations.
              </Text>
            </View>
          )}
        </ScrollView>
      </Card>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bg1.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Header
          centerComponent={{
            text: 'BeaconSmart',
            style: styles.headerText,
          }}
          containerStyle={styles.header}
          rightComponent={
            <TouchableOpacity onPress={handleLogout}>
              <Icon name="sign-out" size={24} color="white" />
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Welcome Text Box */}
          <View style={styles.box}>
            <Text style={styles.welcomeText}>Welcome to BeaconSmart, {email}!</Text>
          </View>

          <Text style={styles.sectionTitle}>BLE Receiver</Text>
          {renderDeviceData()}

          {/* Live Prices Section */}
          <Text style={styles.subHeading}>Live Prices of Fruits and Vegetables:</Text>
          {productLoading ? (
            <ActivityIndicator size="large" color="#6C63FF" />
          ) : (
            <View style={styles.productGrid}>
              {products.map((product) => (
                <TouchableOpacity key={product.id} style={styles.productCard}>
                  <Image
                    source={{ uri: productImages[product.id] || product.image }} // Use Pexels image if available
                    style={styles.productImage}
                  />
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.chatbotButton}
          onPress={() => navigation.navigate('ChatBot', { emailid: email })}
        >
          <Icon name="comment" size={30} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Card containerStyle={styles.modalCard}>
                <Text style={styles.modalTitle}>{selectedProduct?.key}</Text>
                <Text style={styles.modalText}>{selectedProduct?.value}</Text>
                {pexelsImage && (
                  <Image source={{ uri: pexelsImage }} style={styles.productImage} />
                )}
                <Text style={styles.modalText}>Price: ₹99</Text>
                <Text style={styles.modalText}>Expiry Date: 10/4/2025</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </Card>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6C63FF',
    borderBottomWidth: 0,
    elevation: 15,
    paddingBottom: 15,
    paddingTop: StatusBar.currentHeight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  scrollContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    color: '#6C63FF',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 5,
  },
  deviceCard: {
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    borderRadius: 8,
    marginVertical: 5,
    padding: 10,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  productDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#6C63FF',
  },
  subHeading: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#6C63FF',
    textAlign: 'center',
    marginTop: 5,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6C63FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalCard: {
    borderRadius: 10,
    padding: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6C63FF',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6C63FF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Home;