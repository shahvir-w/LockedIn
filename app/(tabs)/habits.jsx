import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import EmptyHabits from '../../components/EmptyHabits';
import HabitsScrollView from '../../components/HabitsScrollView';
import useMostRecentDate from '../../databaseUtils/FindRecentDate';
import { duplicateHabits } from '../../databaseUtils/CreateDays';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from "../../constants/colors"
import { useContext } from 'react';
import { ThemeContext } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHabits, fetchOldestDate } from '../../databaseUtils/FirebaseUtils';

export default function Habits() {
  const [userHabits, setUserHabits] = useState([]);
  const [remainingTasks, setRemainingTasks] = useState(0);
  const today = new Date().toLocaleDateString();
  const [date, setDate] = useState(today);
  const mostRecentDate = useMostRecentDate();
  const [oldestDate, setOldestDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const {theme} = useContext(ThemeContext)
  let activeColors = colors[theme.mode]

  useEffect(() => {
    // for duplicating previous habits/tasks each day
    const duplicate = async () => {
      if (mostRecentDate && today !== mostRecentDate && mostRecentDate != "no data") {
        await duplicateHabits(mostRecentDate, today);
      }
    };

    duplicate();
  }, [mostRecentDate, today]);

  const modifyDate = (dateString, days) => {
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const handleDateLeft = () => {
    // accessing previous date
    const newDate = modifyDate(date, -1);
    if (newDate >= oldestDate) setDate(newDate);
  };

  const handleDateRight = () => {
    // accessing next date
    const newDate = modifyDate(date, 1);
    if (newDate <= today) setDate(newDate);
  };

  useEffect(() => {
    // loading habits when date changes
    const fetchHabits = async () => {
      const uid = await AsyncStorage.getItem('userUID');
      const firstDay = await fetchOldestDate(uid);
      setOldestDate(firstDay);

      const unsubscribe = await loadHabits(uid, date, setUserHabits, setRemainingTasks);
      await new Promise(resolve => setTimeout(resolve, 140));
      setIsLoading(false);

      return () => unsubscribe();
    };

    setIsLoading(true);
    fetchHabits();
  }, [date]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={[styles.main, { backgroundColor: activeColors.backgroundMain }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Locked-In-Logo.png')}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>locked in</Text>
          </View>

          <View style={styles.dateScroll}>
            <TouchableOpacity onPress={handleDateLeft}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            >
              <AntDesign name="left" size={20} color= {activeColors.regular} />
            </TouchableOpacity>
            
            <Text style={[styles.dateText, { color: activeColors.regular}]}>{date === today ? 'TODAY' : date}</Text>

            <TouchableOpacity onPress={handleDateRight}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
            >
              <AntDesign name="right" size={20} color= {activeColors.regular} />
            </TouchableOpacity>
          </View>
        </View>
        
        {!isLoading && (
          userHabits.length === 0 ? (
            <EmptyHabits date={date} />
          ) : (
            <HabitsScrollView habits={userHabits} remainingTasks={remainingTasks} date={date} />
          )
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 80,
  },
  logoContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  logoImage: {
    height: 60,
    width: 55,
    left: 0,
  },
  logoText: {
    fontFamily: 'JockeyOne',
    fontSize: 25,
    color: '#7C81FC',
    top: 13,
    left: -8,
  },
  dateScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    left: -15,
    top: 2,
  },
  dateText: {
    fontFamily: 'aldrich',
    fontSize: 18,
    color: '#fff',
    marginHorizontal: 6,
    top: 1,
  },
});