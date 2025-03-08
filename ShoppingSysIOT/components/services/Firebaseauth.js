// import { initializeApp } from 'firebase/app';
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCJE9zxxHmo66Pr2hQYSorLAwTZIFnwKvk",
//   authDomain: "beaconiot.firebaseapp.com",
//   projectId: "beaconiot",
//   storageBucket: "beaconiot.appspot.com",
//   messagingSenderId: "136051041270",
//   appId: "1:136051041270:web:efdf28928a593c3fe69dd7",
//   measurementId: "G-WKK2Y3T38W"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Auth
// let auth;
// if (typeof window !== 'undefined') {
//   // Web environment
//   const { getAuth } = require('firebase/auth');
//   auth = getAuth(app);
// } else {
//   // React Native environment
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//   });
// }

// export { auth };
 
import { initializeApp ,getApps} from 'firebase/app';
import { initializeAuth, getReactNativePersistence,getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCJE9zxxHmo66Pr2hQYSorLAwTZIFnwKvk",
  authDomain: "beaconiot.firebaseapp.com",
  projectId: "beaconiot",
  storageBucket: "beaconiot.firebasestorage.app",
  messagingSenderId: "136051041270",
  appId: "1:136051041270:web:efdf28928a593c3fe69dd7",
  measurementId: "G-WKK2Y3T38W"
};
let auth; 
// if(getApps().length === 0){
//   const app = initializeApp(firebaseConfig);
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//   });
// }
// else{
//   auth = getAuth();

// }
// const app = initializeApp(firebaseConfig);

// auth = initializeAuth(app);

const app = initializeApp(firebaseConfig);
 
auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});  
 
export { auth };
 
  
 
   