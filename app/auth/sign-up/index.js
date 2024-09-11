import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native'
import React, { useEffect } from 'react'
import { colors } from '@/constants/colors'
import { useNavigation, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../configs/FirebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirstDay } from '../../../backend/CreateDays';


export default function SignIn() {
    const router = useRouter();

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [isvalid, setIsValid] = useState(true);
    const today = new Date().toLocaleDateString();

    const OnCreateAccount= async () => {
        if (!name || !email || !password) { 
            setIsValid(false);
            return;
        }

        try { 
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
                uid: user.uid,
                createdAt: today
            });
            
            await AsyncStorage.setItem('userUID', user.uid);
            await AsyncStorage.setItem('userName', name);
            initializeFirstDay();

            if (user) router.replace('/habits');

        } catch(error) {
            const errorMessage = error.message;
            console.log(errorMessage);
            setIsValid(false);
        };
    }
    
    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <LinearGradient
            colors={['#3b3b3b', 'black', '#3b3b3b']}
            style={styles.linearGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            >
                <SafeAreaView style={[styles.main]}>
                    
                    <TouchableOpacity onPress={()=>router.back()}>
                    <Ionicons name="chevron-back" size={30} color="#7C81FC" style={[styles.arrow]}/>
                    </TouchableOpacity>
                    
                    <View style={styles.container}>
                    <Image source={require('../../../assets/images/Locked-In-Logo.png')}
                        style={{
                            height: 96,
                            width: 88,
                            left: 0,
                        }}
                    />
                    <View >
                        <Text style={{
                            fontFamily: 'JockeyOne',
                            fontSize: 41,
                            color: colors.PURPLE,
                            top: 18,
                            left: -12,
                        }}>locked in</Text>
                    </View>
                    </View>
                    
                    <View>
                    <Text style={{
                        fontFamily: 'Aldrich',
                        fontSize: 32,
                        color: colors.PURPLE,
                        textAlign: 'center',
                        top: -60,
                    }}>create new account</Text>
                    <Text style={{
                        fontFamily: 'Shippori',
                        fontSize: 17,
                        color: colors.PURPLE,
                        left: 10,
                        textAlign: 'left',
                        top: -25,
                    }}>First Name</Text>
                    <TextInput 
                        style={[styles.input]}
                        placeholder="Enter your first name"
                        onChangeText={(text)=>setName(text)}    
                        maxLength={15}
                    />
                    </View>

                    <View>
                    <Text style={{
                        fontFamily: 'Shippori',
                        fontSize: 17,
                        color: colors.PURPLE,
                        left: 10,
                        textAlign: 'left',
                        top: -10,
                    }}>Email</Text>
                    <TextInput 
                        style={[styles.input, { top: -10 }]}
                        placeholder="Enter your email"
                        onChangeText={(text) => setEmail(text)}
                        />
                    </View>

                    <View>
                    <Text style={{
                        fontFamily: 'Shippori',
                        fontSize: 17,
                        color: colors.PURPLE,
                        left: 10,
                        textAlign: 'left',
                        top: 5,
                    }}>Password</Text>
                    <TextInput 
                        style={[styles.input, { top: 5 }]}
                        placeholder="Enter password"
                        secureTextEntry={true}
                        onChangeText={(text) => setPassword(text)}
                        />
                    </View>
                    
                    <TouchableOpacity style={styles.button}
                    onPress={OnCreateAccount}
                    >
                    <Text style={{
                        fontFamily: 'Shippori',
                        fontSize: 14,
                        textAlign: 'center',
                        color: colors.WHITE,
                    }}>{isvalid ? "sign up" : "invalid, try again"}</Text>
                    </TouchableOpacity>

                </SafeAreaView>
            </LinearGradient>
        </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  arrow: {
    left: -140,
    top: -30,
  },
  linearGradient: {
    flex: 0,
    width: '100%',
    height: '120%',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    top: -142.5,
  },
  container: {
    flexDirection: 'row',
    marginBottom: 80,
    alignSelf: 'center',
  },
  input: {
    placeholderTextColor:"#949494",
    selectionColor:"#949494",
    fontFamily: 'Shippori',
    fontSize: 14,
    color: "#949494",
    padding: 10,
    borderWidth: 1,
    borderColor: colors.PURPLE,
    height: 40,
    width: 320,
    alignSelf: 'center',
    borderRadius: 15,
    top: -25,
  },
  button: {
    backgroundColor: colors.PURPLE,
    height: 54,
    width: 320,
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: 35,
    justifyContent: 'center',
    top: 5,
  }
});