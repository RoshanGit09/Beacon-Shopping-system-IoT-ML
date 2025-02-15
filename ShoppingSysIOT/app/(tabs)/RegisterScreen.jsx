
import React, { useState } from 'react';
import { Button, Text,TextInput, View } from 'react-native';

import {createUserWithEmailAndPassword} from 'firebase/auth'
import auth from '../../components/services/Firebaseauth'
export default function RegisterScreen () { 
  const [email,setEmail]= useState('') 
  const [password,setPassword]= useState('') 

  const handleRegister = () => {
    console.log(email,password);
    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredential) => {
   
      const user = userCredential.user;
      console.log(user);
      
      // ...
    })
    
  }
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize:20,fontWeight:'bold'}}>Register</Text>
          <TextInput
          onChangeText={setEmail}
            placeholder="Email"
            style={{width: 200,
               height: 40, 
               borderColor: 'gray', 
               borderWidth: 1,
               marginBottom: 10,
               marginTop: 10,
              paddingHorizontal: 10,}}
            ></TextInput>
            <TextInput 
            onChangeText={setPassword}
            placeholder="Password"
            style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10,}}
            ></TextInput>
            <Button title="Register" onPress={handleRegister}></Button>
            <Text style={{marginVertical:10}}>Already have an account? Login</Text>
        </View>
    );
};

