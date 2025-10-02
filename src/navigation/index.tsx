import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccueilScreen from '../screens/AccueilScreen';
import PatientsListScreen from '../screens/PatientsListScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import DonneeDetailScreen from '../screens/DonneeDetailScreen';
import ConsultationDetailScreen from '../screens/ConsultationDetailScreen';
import ExamenDetailScreen from '../screens/ExamenDetailScreen';
import ParametresScreen from '../screens/ParametresScreen';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PatientsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientsListe" component={PatientsListScreen} options={{ title: 'Patients' }} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Dossier patient' }} />
      <Stack.Screen name="DonneeDetail" component={DonneeDetailScreen} options={{ title: 'Donnée sanitaire' }} />
      <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} options={{ title: 'Consultation' }} />
      <Stack.Screen name="ExamenDetail" component={ExamenDetailScreen} options={{ title: 'Examen' }} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        }
      }}
    >
      <Tab.Screen name="Accueil" component={AccueilScreen} options={{
        tabBarIcon: ({ color, focused }) => (
          <Text style={{ 
            color, 
            fontSize: focused ? 24 : 20,
            transform: [{ scale: focused ? 1.1 : 1 }]
          }}>🏠</Text>
        ),
        tabBarLabel: 'Accueil',
      }} />
      <Tab.Screen name="Patients" component={PatientsStack} options={{
        tabBarIcon: ({ color, focused }) => (
          <Text style={{ 
            color, 
            fontSize: focused ? 24 : 20,
            transform: [{ scale: focused ? 1.1 : 1 }]
          }}>👥</Text>
        ),
        tabBarLabel: 'Patients',
      }} />
      <Tab.Screen name="Paramètres" component={ParametresScreen} options={{
        tabBarIcon: ({ color, focused }) => (
          <Text style={{ 
            color, 
            fontSize: focused ? 24 : 20,
            transform: [{ scale: focused ? 1.1 : 1 }]
          }}>⚙️</Text>
        ),
        tabBarLabel: 'Paramètres',
      }} />
    </Tab.Navigator>
  );
}
