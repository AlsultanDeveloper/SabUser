// 🛍️ SAB Market Checkout Details - Address & Payment
// Modern checkout flow for SAB Market

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMarket } from '@/contexts/MarketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';
import MapPicker from '@/components/MapPicker';
import { useOrders } from '@/contexts/OrderContext';
import type { OrderItem, SavedAddress } from '@/types';
import { getUserAddresses } from '@/constants/firestore';
import Toast from 'react-native-toast-message';

export default function MarketCheckoutDetailsScreen() {
  const router = useRouter();
  const { marketCart, marketCartTotal, clearMarketCart, language, updateMarketCartQuantity, removeFromMarketCart } = useMarket();
  const { user } = useAuth();
  const { createOrder } = useOrders();

  // Shipping Address State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);

  // Area/Region Picker State
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'omt' | 'whish'>('cash');
  
  // Map Picker State
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Free delivery threshold
  const FREE_DELIVERY_THRESHOLD = 30;
  const MINIMUM_ORDER_VALUE = 2;
  
  // Exchange rate USD to LBP (Lebanese Pound)
  const USD_TO_LBP = 89700; // Update this rate as needed
  
  // Lebanese Governorates and Areas with shipping costs (Total: 144 areas)
  const GOVERNORATES = [
    {
      id: 'akkar',
      name: 'Akkar',
      nameAr: 'عكار',
      active: true,
      areas: [
        { name: 'Aadouiye', nameAr: 'Aadouiye', price: 5.00 },
        { name: 'Aamara', nameAr: 'Aamara', price: 5.00 },
        { name: 'Aarida', nameAr: 'Aarida', price: 5.00 },
        { name: 'Aarmen', nameAr: 'Aarmen', price: 2.00 },
        { name: 'Aarqa', nameAr: 'Aarqa', price: 5.00 },
        { name: 'Aayoun El Ghezlane', nameAr: 'Aayoun El Ghezlane', price: 5.00 },
        { name: 'Abde', nameAr: 'Abde', price: 5.00 },
        { name: 'Ain Yaaqoub', nameAr: 'Ain Yaaqoub', price: 5.00 },
        { name: 'Akroum', nameAr: 'Akroum', price: 5.00 },
        { name: 'Al Massoudieh', nameAr: 'Al Massoudieh', price: 5.00 },
        { name: 'Aydamoun', nameAr: 'Aydamoun', price: 5.00 },
        { name: 'Bahsa', nameAr: 'Bahsa', price: 5.00 },
        { name: 'Balde', nameAr: 'Balde', price: 5.00 },
        { name: 'Bebnine', nameAr: 'Bebnine', price: 5.00 },
        { name: 'Beino', nameAr: 'Beino', price: 5.00 },
        { name: 'Beit Ayoub', nameAr: 'Beit Ayoub', price: 5.00 },
        { name: 'Beit Younes', nameAr: 'Beit Younes', price: 5.00 },
        { name: 'Beit El Haj', nameAr: 'Beit El Haj', price: 5.00 },
        { name: 'Beit El Haouch', nameAr: 'Beit El Haouch', price: 5.00 },
        { name: 'Berqayel', nameAr: 'Berqayel', price: 5.00 },
        { name: 'Bezbina (north)', nameAr: 'Bezbina (north)', price: 5.00 },
        { name: 'Bhannine', nameAr: 'Bhannine', price: 5.00 },
        { name: 'Bire Akkar', nameAr: 'Bire Akkar', price: 5.00 },
        { name: 'Borj El Arab', nameAr: 'Borj El Arab', price: 5.00 },
        { name: 'Bqerzala', nameAr: 'Bqerzala', price: 5.00 },
        { name: 'Bzal', nameAr: 'Bzal', price: 5.00 },
        { name: 'Cheikh Aayash', nameAr: 'Cheikh Aayash', price: 5.00 },
        { name: 'Cheikh Hmairine', nameAr: 'Cheikh Hmairine', price: 5.00 },
        { name: 'Cheikh Taba Montagne', nameAr: 'Cheikh Taba Montagne', price: 5.00 },
        { name: 'Cheikh Taba Es Sahl', nameAr: 'Cheikh Taba Es Sahl', price: 5.00 },
        { name: 'Cheikh Zennad Talbibe', nameAr: 'Cheikh Zennad Talbibe', price: 5.00 },
        { name: 'Dayret Nahr El Kabir', nameAr: 'Dayret Nahr El Kabir', price: 5.00 },
        { name: 'Deir Janine', nameAr: 'Deir Janine', price: 5.00 },
        { name: 'Dinbou', nameAr: 'Dinbou', price: 5.00 },
        { name: 'El Houaich', nameAr: 'El Houaich', price: 5.00 },
        { name: 'El Majdel', nameAr: 'El Majdel', price: 5.00 },
        { name: 'El Mqaiteaa', nameAr: 'El Mqaiteaa', price: 5.00 },
        { name: 'El Qlaiaat', nameAr: 'El Qlaiaat', price: 5.00 },
        { name: 'El Qorne', nameAr: 'El Qorne', price: 5.00 },
        { name: 'En Nabi Youchaa', nameAr: 'En Nabi Youchaa', price: 5.00 },
        { name: 'Er Rihaniye El Minieh', nameAr: 'Er Rihaniye El Minieh', price: 5.00 },
        { name: 'Es Sfine', nameAr: 'Es Sfine', price: 5.00 },
        { name: 'Fnaideq', nameAr: 'Fnaideq', price: 5.00 },
        { name: 'Habchit', nameAr: 'Habchit', price: 5.00 },
        { name: 'Halba', nameAr: 'Halba', price: 5.00 },
        { name: 'Haret Ej Jdide', nameAr: 'Haret Ej Jdide', price: 5.00 },
        { name: 'Hikr Janine', nameAr: 'Hikr Janine', price: 5.00 },
        { name: 'Hissa', nameAr: 'Hissa', price: 5.00 },
        { name: 'Hrar', nameAr: 'Hrar', price: 5.00 },
        { name: 'Janine', nameAr: 'Janine', price: 5.00 },
        { name: 'Kawashra', nameAr: 'Kawashra', price: 5.00 },
        { name: 'Kfar Noun', nameAr: 'Kfar Noun', price: 5.00 },
        { name: 'Kfartoun', nameAr: 'Kfartoun', price: 5.00 },
        { name: 'Khirbet Daoud', nameAr: 'Khirbet Daoud', price: 5.00 },
        { name: 'Khouchah', nameAr: 'Khouchah', price: 5.00 },
        { name: 'Kouikhat', nameAr: 'Kouikhat', price: 5.00 },
        { name: 'Kousha', nameAr: 'Kousha', price: 5.00 },
        { name: 'Machta Hammoud', nameAr: 'Machta Hammoud', price: 5.00 },
        { name: 'Machta Hassan', nameAr: 'Machta Hassan', price: 5.00 },
        { name: 'Mar Touma', nameAr: 'Mar Touma', price: 5.00 },
        { name: 'Markabta', nameAr: 'Markabta', price: 5.00 },
        { name: 'Mazraat Al Balde', nameAr: 'Mazraat Al Balde', price: 5.00 },
        { name: 'Mechmech', nameAr: 'Mechmech', price: 5.00 },
        { name: 'Memnaa', nameAr: 'Memnaa', price: 5.00 },
        { name: 'Mhamra', nameAr: 'Mhamra', price: 5.00 },
        { name: 'Minyara', nameAr: 'Minyara', price: 5.00 },
        { name: 'Msalla', nameAr: 'Msalla', price: 5.00 },
        { name: 'Nabaa El Ghzaile', nameAr: 'Nabaa El Ghzaile', price: 5.00 },
        { name: 'Nahr El Bared', nameAr: 'Nahr El Bared', price: 5.00 },
        { name: 'Najmet Es Sobh', nameAr: 'Najmet Es Sobh', price: 5.00 },
        { name: 'Nfaisseh', nameAr: 'Nfaisseh', price: 5.00 },
        { name: 'Qaabrine', nameAr: 'Qaabrine', price: 5.00 },
        { name: 'Qabaait', nameAr: 'Qabaait', price: 5.00 },
        { name: 'Qarqaf', nameAr: 'Qarqaf', price: 5.00 },
        { name: 'Qloud El Baqieh', nameAr: 'Qloud El Baqieh', price: 5.00 },
        { name: 'Rahbe', nameAr: 'Rahbe', price: 5.00 },
        { name: 'Rihaniye', nameAr: 'Rihaniye', price: 5.00 },
        { name: 'Safinet Al Draib', nameAr: 'Safinet Al Draib', price: 5.00 },
        { name: 'Saidnaya', nameAr: 'Saidnaya', price: 5.00 },
        { name: 'Sammouniye', nameAr: 'Sammouniye', price: 5.00 },
        { name: 'Semmaqiye', nameAr: 'Semmaqiye', price: 5.00 },
        { name: 'Shaqdouf Aakkar', nameAr: 'Shaqdouf Aakkar', price: 5.00 },
        { name: 'Sharbine El Faouqa', nameAr: 'Sharbine El Faouqa', price: 5.00 },
        { name: 'Sindianet Zeidane', nameAr: 'Sindianet Zeidane', price: 5.00 },
        { name: 'Takrit', nameAr: 'Takrit', price: 5.00 },
        { name: 'Tashea', nameAr: 'Tashea', price: 5.00 },
        { name: 'Wadi Ej Jamous', nameAr: 'Wadi Ej Jamous', price: 5.00 },
        { name: 'Wadi Khaled', nameAr: 'Wadi Khaled', price: 5.00 },
        { name: 'Zouarib', nameAr: 'Zouarib', price: 5.00 },
        { name: 'Zouk Haddara', nameAr: 'Zouk Haddara', price: 5.00 }
      ]
    },
    {
      id: 'tripoli',
      name: 'Tripoli',
      nameAr: 'طرابلس',
      active: true,
      areas: [
        { name: 'Abou Samra', nameAr: 'Abou Samra', price: 1.50 },
        { name: 'Ain Faouar', nameAr: 'Ain Faouar', price: 4.00 },
        { name: 'Azmi', nameAr: 'Azmi', price: 1.50 },
        { name: 'Bahsas', nameAr: 'Bahsas', price: 1.50 },
        { name: 'Dahr Alain', nameAr: 'Dahr Alain', price: 4.00 },
        { name: 'Dam Wal Farz', nameAr: 'Dam Wal Farz', price: 1.50 },
        { name: 'El Mina', nameAr: 'El Mina', price: 1.50 },
        { name: 'Maarad', nameAr: 'Maarad', price: 1.50 },
        { name: 'Malaab', nameAr: 'Malaab', price: 1.50 },
        { name: 'Qalamoun', nameAr: 'Qalamoun', price: 4.00 },
        { name: 'Qoubbe', nameAr: 'Qoubbe', price: 3.00 },
        { name: 'Ras Maska', nameAr: 'Ras Maska', price: 4.00 },
        { name: 'Tal', nameAr: 'Tal', price: 1.00 },
        { name: '3alma', nameAr: '3alma', price: 4.00 },
        { name: 'Badawi', nameAr: 'Badawi', price: 4.00 },
        { name: 'Zahrieh', nameAr: 'Zahrieh', price: 1.5 }
      ]
    },
    {
      id: 'koura',
      name: 'Koura',
      nameAr: 'الكورة',
      active: true,
      areas: [
        { name: 'Amioun', nameAr: 'Amioun', price: 4.00 },
        { name: 'Balamand', nameAr: 'Balamand', price: 6.00 },
        { name: 'Barsa', nameAr: 'Barsa', price: 5.00 },
        { name: 'Batroumine', nameAr: 'Batroumine', price: 10.00 },
        { name: 'Bechmizzine', nameAr: 'Bechmizzine', price: 10.00 },
        { name: 'Bkeftine', nameAr: 'Bkeftine', price: 10.00 },
        { name: 'Bsarma', nameAr: 'Bsarma', price: 10.00 },
        { name: 'Btouratij', nameAr: 'Btouratij', price: 10.00 },
        { name: 'Btourram', nameAr: 'Btourram', price: 12.00 },
        { name: 'Dedde', nameAr: 'Dedde', price: 7.00 },
        { name: 'En Nakhle', nameAr: 'En Nakhle', price: 7.00 },
        { name: 'Kafraiya', nameAr: 'Kafraiya', price: 12.00 },
        { name: 'Kaftoun', nameAr: 'Kaftoun', price: 12.00 },
        { name: 'Kalhat', nameAr: 'Kalhat', price: 14.00 },
      ]
    },
    {
      id: 'zgharta',
      name: 'Zgharta',
      nameAr: 'زغرتا',
      active: true,
      areas: [
        { name: 'Aachach', nameAr: 'Aachach', price: 5.00 },
        { name: 'Bchannine', nameAr: 'Bchannine', price: 5.00 },
        { name: 'Bnechaai', nameAr: 'Bnechaai', price: 5.00 },
        { name: 'Bsibaal', nameAr: 'Bsibaal', price: 5.00 },
        { name: 'Darayia', nameAr: 'Darayia', price: 5.00 },
        { name: 'Ejbeaa', nameAr: 'Ejbeaa', price: 5.00 },
        { name: 'El Houakir', nameAr: 'El Houakir', price: 5.00 },
        { name: 'Er Rmaile', nameAr: 'Er Rmaile', price: 5.00 },
        { name: 'Fouwar Zgharta', nameAr: 'Fouwar Zgharta', price: 5.00 },
        { name: 'Haret Al Fouwar', nameAr: 'Haret Al Fouwar', price: 5.00 },
        { name: 'Harfe Arde', nameAr: 'Harfe Arde', price: 5.00 },
        { name: 'Hariq Zgharta', nameAr: 'Hariq Zgharta', price: 5.00 },
        { name: 'Hilane', nameAr: 'Hilane', price: 5.00 },
        { name: 'Hraykess', nameAr: 'Hraykess', price: 5.00 },
        { name: 'Jdaideh', nameAr: 'Jdaideh', price: 5.00 },
        { name: 'Kafar Zeina', nameAr: 'Kafar Zeina', price: 4.00 },
        { name: 'Kafraiya Zgharta', nameAr: 'Kafraiya Zgharta', price: 5.00 },
        { name: 'Kfar Hatta (zgharta)', nameAr: 'Kfar Hatta (zgharta)', price: 8.00 },
        { name: 'Majdalaya Zgharta', nameAr: 'Majdalaya Zgharta', price: 4.00 },
        { name: 'Majdel El Koura', nameAr: 'Majdel El Koura', price: 4.00 },
        { name: 'Martmoura', nameAr: 'Martmoura', price: 7.00 },
        { name: 'Miryata', nameAr: 'Miryata', price: 5.00 },
        { name: 'Miziara', nameAr: 'Miziara', price: 5.00 }
      ]
    },
    // Coming Soon Cities
    {
      id: 'beirut',
      name: 'Beirut',
      nameAr: 'بيروت',
      active: false,
      comingSoon: true,
      areas: []
    },
    {
      id: 'mount_lebanon',
      name: 'Mount Lebanon',
      nameAr: 'جبل لبنان',
      active: false,
      comingSoon: true,
      areas: []
    },
    {
      id: 'south',
      name: 'South Lebanon',
      nameAr: 'الجنوب',
      active: false,
      comingSoon: true,
      areas: []
    },
    {
      id: 'batroun',
      name: 'Batroun',
      nameAr: 'البترون',
      active: false,
      comingSoon: true,
      areas: []
    },
    {
      id: 'bekaa',
      name: 'Bekaa',
      nameAr: 'البقاع',
      active: false,
      comingSoon: true,
      areas: []
    },
    {
      id: 'bsharri',
      name: 'Bsharri',
      nameAr: 'بشري',
      active: false,
      comingSoon: true,
      areas: []
    },
  ];

  // Flatten all areas for easy lookup
  const AREAS_LIST = GOVERNORATES.flatMap(gov => 
    gov.areas.map(area => ({
      ...area,
      governorate: gov.name,
      governorateAr: gov.nameAr,
    }))
  );
  
  // Shipping costs by neighborhood/area (Lebanon - Beirut example)
  // You can customize these areas and prices
  const SHIPPING_BY_AREA: { [key: string]: number } = {
    // Beirut Areas
    'ashrafieh': 3,
    'achrafieh': 3,
    'hamra': 3,
    'verdun': 3,
    'ras beirut': 3,
    'ain el mraiseh': 3,
    'manara': 3,
    'raouche': 4,
    'ramlet el bayda': 4,
    'ain el tineh': 4,
    'mazraa': 4,
    'bachoura': 3,
    'mar elias': 3,
    'tarik jdideh': 4,
    'furn el chebbak': 5,
    'sin el fil': 5,
    'dekwaneh': 6,
    'bourj hammoud': 6,
    'antelias': 7,
    'jal el dib': 7,
    'jounieh': 10,
    'dbayeh': 8,
    'baabda': 6,
    'hazmieh': 5,
    'hadath': 6,
    // Mount Lebanon
    'zalka': 7,
    'jdeideh': 6,
    'mansourieh': 6,
    'beit mery': 8,
    'broummana': 10,
    'bikfaya': 12,
    // South
    'ouzai': 7,
    'airport': 8,
    'khalde': 10,
    'choueifat': 8,
    // Default
    'default': 5,
  };

  // Calculate shipping cost based on selected area
  const calculateShippingCost = (): number => {
    if (!selectedArea) {
      return 0; // No shipping cost if area not selected
    }

    const area = AREAS_LIST.find(a => a.name === selectedArea);
    return area ? area.price : 0;
  };
  
  // Calculate shipping cost - Free if order is $30 or more
  const safeCartTotal = typeof marketCartTotal === 'number' && !isNaN(marketCartTotal) ? marketCartTotal : 0;
  const baseShippingCost = calculateShippingCost();
  const finalShippingCost = safeCartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : baseShippingCost;
  const finalTotal = safeCartTotal + finalShippingCost;

  // Format price - ensure valid number
  const formatPrice = (price: number) => {
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
    return `$${validPrice.toFixed(2)}`;
  };

  // Format LBP price
  const formatLBP = (usdPrice: number) => {
    const lbpAmount = usdPrice * USD_TO_LBP;
    
    // تقريب للألف الأقرب: إذا آخر 3 أرقام >= 500 نزيد، وإلا نرجع صفر
    const roundedAmount = Math.round(lbpAmount / 1000) * 1000;
    
    return `LBP ${roundedAmount.toLocaleString('en-US')}`;
  };

  // Load saved addresses on mount
  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user?.uid) return;
      
      try {
        setLoadingSavedAddresses(true);
        const addresses = await getUserAddresses(user.uid);
        setSavedAddresses(addresses as SavedAddress[]);
        
        // Auto-show saved addresses if available
        if (addresses.length > 0) {
          setShowSavedAddresses(true);
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
      } finally {
        setLoadingSavedAddresses(false);
      }
    };

    loadSavedAddresses();
  }, [user?.uid]);

  // Get Current Location
  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature');
        return;
      }

      Alert.alert('Getting Location', 'Please wait...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        setAddress(`${addr.street || ''} ${addr.name || ''}`);
        setCity(addr.city || addr.region || '');
        setPostalCode(addr.postalCode || '');
        
        Alert.alert('Success', 'Location detected successfully!');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  // Select a saved address
  const handleSelectSavedAddress = (savedAddress: SavedAddress) => {
    setSelectedSavedAddress(savedAddress);
    setFullName(savedAddress.fullName);
    setPhone(savedAddress.phoneNumber);
    setAddress(savedAddress.address);
    setCity(savedAddress.city);
    setPostalCode(savedAddress.postalCode || '');
    setLatitude(savedAddress.latitude || null);
    setLongitude(savedAddress.longitude || null);
    setShowSavedAddresses(false);
    Alert.alert('✅ Address Selected', `Using "${savedAddress.label || 'Home'}" address`);
  };

  // Handle Remove Item from Cart
  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      language === 'ar' ? 'حذف المنتج' : 'Remove Item',
      language === 'ar' ? 'هل تريد حذف هذا المنتج من السلة؟' : 'Do you want to remove this item from cart?',
      [
        {
          text: language === 'ar' ? 'إلغاء' : 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'ar' ? 'حذف' : 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromMarketCart(productId);
            
            // If cart is empty after removal, go back to shopping
            if (marketCart.length === 1) {
              Alert.alert(
                language === 'ar' ? 'السلة فارغة' : 'Cart Empty',
                language === 'ar' ? 'تم إفراغ السلة. العودة للتسوق...' : 'Cart is now empty. Returning to shopping...',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/market' as any),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  // Handle Update Quantity
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateMarketCartQuantity(productId, newQuantity);
  };

  // Open Maps to Pick Location
  const handleOpenMaps = () => {
    setShowMapPicker(true);
  };

  // Handle location selected from map
  const handleLocationSelected = async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    
    if (location.address) {
      setAddress(location.address);
    }
    
    // Try to get more detailed address info
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        if (!location.address) {
          setAddress(`${addr.street || ''} ${addr.name || ''}`);
        }
        
        // Try to match city with our areas list
        const detectedCity = addr.city || addr.region || addr.subregion || '';
        
        // محاولة مطابقة المدينة مع قائمتنا
        const matchedArea = AREAS_LIST.find(area => 
          area.name.toLowerCase().includes(detectedCity.toLowerCase()) ||
          area.nameAr.includes(detectedCity) ||
          detectedCity.toLowerCase().includes(area.name.toLowerCase())
        );
        
        if (matchedArea) {
          // لقينا مطابقة - نحط المدينة تلقائياً
          setSelectedArea(matchedArea.name);
          setCity(matchedArea.name);
          
          Toast.show({
            type: 'success',
            text1: language === 'ar' ? 'تم تحديد المدينة تلقائياً' : 'City auto-detected',
            text2: language === 'ar' ? matchedArea.nameAr : matchedArea.name,
            position: 'top',
            visibilityTime: 3000,
          });
        } else {
          // ما لقينا مطابقة - نطلب من المستخدم يختار
          setCity(detectedCity);
          
          Alert.alert(
            language === 'ar' ? 'اختر المدينة' : 'Select City',
            language === 'ar' 
              ? 'لم نتمكن من تحديد المدينة تلقائياً. الرجاء اختيارها من القائمة لحساب رسوم التوصيل.'
              : 'We couldn\'t auto-detect your city. Please select it from the list to calculate shipping fees.',
            [
              {
                text: language === 'ar' ? 'اختر المدينة' : 'Select City',
                onPress: () => setShowAreaPicker(true),
              }
            ]
          );
        }
        
        setPostalCode(addr.postalCode || '');
      }
    } catch (error) {
      console.error('Error getting address details:', error);
      
      // لو في خطأ، نطلب من المستخدم يختار المدينة يدوياً
      Alert.alert(
        language === 'ar' ? 'اختر المدينة' : 'Select City',
        language === 'ar' 
          ? 'الرجاء اختيار المدينة من القائمة لحساب رسوم التوصيل.'
          : 'Please select your city from the list to calculate shipping fees.',
        [
          {
            text: language === 'ar' ? 'اختر المدينة' : 'Select City',
            onPress: () => setShowAreaPicker(true),
          }
        ]
      );
    }
  };

  // Validate and Place Order
  const handlePlaceOrder = async () => {
    // Check if user is logged in FIRST
    if (!user || !user.uid) {
      // Redirect to account page
      router.push('/(tabs)/account' as any);
      return;
    }

    // Check minimum order value
    if (safeCartTotal < MINIMUM_ORDER_VALUE) {
      Alert.alert(
        language === 'ar' ? 'قيمة الطلب قليلة' : 'Order Too Small',
        language === 'ar' 
          ? `الحد الأدنى للطلب هو ${formatPrice(MINIMUM_ORDER_VALUE)}. قيمة طلبك الحالية ${formatPrice(safeCartTotal)}.`
          : `Minimum order value is ${formatPrice(MINIMUM_ORDER_VALUE)}. Your current order is ${formatPrice(safeCartTotal)}.`
      );
      return;
    }

    // Validation
    if (!fullName || !phone || !address || !selectedArea) {
      Alert.alert(
        language === 'ar' ? 'معلومات ناقصة' : 'Missing Information', 
        language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة واختيار المنطقة' : 'Please fill in all required fields and select your area'
      );
      return;
    }

    // Show loading
    Alert.alert('Processing', 'Please wait...');

    try {
      // Prepare order items from market cart
      const orderItems: OrderItem[] = marketCart.map((item) => {
        const productName = typeof item.name === 'string' 
          ? item.name 
          : item.name?.[language as 'en' | 'ar'] || item.name?.en || 'Product';

        // Create clean product object without undefined values
        const cleanProduct: any = {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || '',
          images: item.image ? [item.image] : [],
          description: productName,
          category: 'SAB Market',
          brand: 'SAB Market',
          rating: 0,
          reviews: 0,
          inStock: true,
        };

        // Add optional fields only if they exist
        if (item.weight) cleanProduct.weight = item.weight;
        if (item.discount != null) cleanProduct.discount = item.discount;

        return {
          product: cleanProduct,
          quantity: item.quantity,
          price: item.discount
            ? item.price * (1 - item.discount / 100)
            : item.price,
        };
      });

      // Prepare address with coordinates
      const orderAddress = {
        fullName,
        phoneNumber: phone,
        address,
        city,
        postalCode: postalCode || '',
        country: 'Lebanon',
        ...(latitude && longitude && {
          latitude,
          longitude,
        }),
      };

      // Create order in Firebase with SAB Market flag
      const order = await createOrder(
        user.uid,
        orderItems,
        finalTotal,
        orderAddress,
        paymentMethod,
        true // ✅ isSabMarket = true for 30 minutes delivery
      );

      console.log('✅ SAB Market Order created successfully:', order.orderNumber);

      // Clear market cart
      clearMarketCart();

      // Show success message
      Alert.alert(
        'Order Placed! 🎉',
        `Your SAB Market order ${order.orderNumber} has been confirmed!\n\nDelivery in 30 minutes\nTotal: ${formatPrice(finalTotal)}${
          latitude && longitude
            ? '\n\n📍 Delivery location saved for tracking'
            : ''
        }`,
        [
          {
            text: 'View Order',
            onPress: () => {
              // First go to orders page, then push to order details
              router.replace('/orders' as any);
              setTimeout(() => {
                router.push(`/order/${order.id}` as any);
              }, 100);
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              router.push('/market' as any);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('❌ Error placing order:', error);
      Alert.alert(
        'Error',
        'Failed to place your order. Please try again.',
        [
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Gradient Header - Orange/Red */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C42', '#FFA95F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'إتمام الطلب' : 'Checkout'}
            </Text>
            <TouchableOpacity 
              style={styles.backToStoreButtonHeader}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.backToStoreTextHeader}>Store</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {marketCart.length} {language === 'ar' ? 'منتجات' : 'items'}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryValueLBP}>{formatLBP(safeCartTotal)}</Text>
            </View>
          </View>
          {safeCartTotal < MINIMUM_ORDER_VALUE && safeCartTotal > 0 && (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', textAlign: 'center' }}>
                ⚠️ {language === 'ar' 
                  ? `الحد الأدنى للطلب ${formatPrice(MINIMUM_ORDER_VALUE)}. أضف ${formatPrice(MINIMUM_ORDER_VALUE - safeCartTotal)} للمتابعة.`
                  : `Minimum order ${formatPrice(MINIMUM_ORDER_VALUE)}. Add ${formatPrice(MINIMUM_ORDER_VALUE - safeCartTotal)} more to continue.`}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'ar' ? 'التوصيل (25 دقيقة)' : 'Max. Delivery (25 min)'}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              {!selectedArea ? (
                <Text style={[styles.summaryValueLBP, { color: '#EF4444', fontWeight: '600' }]}>
                  {language === 'ar' ? 'اختر المدينة' : 'Select City'}
                </Text>
              ) : finalShippingCost === 0 ? (
                <Text style={[styles.summaryValueLBP, { color: '#10B981', fontWeight: '700' }]}>
                  {language === 'ar' ? 'مجاني' : 'FREE'}
                </Text>
              ) : (
                <Text style={styles.summaryValueLBP}>{formatLBP(finalShippingCost)}</Text>
              )}
            </View>
          </View>
          {safeCartTotal < FREE_DELIVERY_THRESHOLD && safeCartTotal > 0 && (
            <View style={styles.freeShippingBanner}>
              <Text style={styles.freeShippingText}>
                🎉 {language === 'ar' 
                  ? `أضف ${formatPrice(FREE_DELIVERY_THRESHOLD - safeCartTotal)} للحصول على توصيل مجاني!` 
                  : `Add ${formatPrice(FREE_DELIVERY_THRESHOLD - safeCartTotal)} more for FREE delivery!`}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          
          {/* Total in LBP */}
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              {language === 'ar' ? 'المجموع' : 'Total'}
            </Text>
            <Text style={styles.totalValueLBP}>{formatLBP(finalTotal)}</Text>
          </View>
          
          {/* Total in USD */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'ar' ? 'المجموع (دولار)' : 'Total (USD)'}
            </Text>
            <Text style={styles.summaryValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>

        {/* Cart Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cart" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'المنتجات' : 'Items'}
            </Text>
          </View>

          <View style={styles.cartItemsList}>
            {marketCart.map((item) => {
              const productName = typeof item.name === 'string' 
                ? item.name 
                : item.name?.[language as 'en' | 'ar'] || item.name?.en || 'Product';
              
              const finalPrice = item.discount
                ? item.price * (1 - item.discount / 100)
                : item.price;

              return (
                <View key={item.id} style={styles.cartItemCard}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cartItemImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>
                      {productName}
                    </Text>
                    
                    {item.weight && (
                      <Text style={styles.cartItemWeight}>{item.weight}</Text>
                    )}
                    
                    <View style={styles.cartItemPriceRow}>
                      {item.discount && item.discount > 0 ? (
                        <>
                          <View style={{ flexDirection: 'column', gap: 2 }}>
                            <Text style={styles.cartItemOriginalPrice}>
                              ${item.price.toFixed(2)}
                            </Text>
                            <Text style={styles.cartItemPrice}>
                              ${finalPrice.toFixed(2)}
                            </Text>
                            <Text style={[styles.cartItemPrice, { fontSize: 11, color: '#6B7280' }]}>
                              {formatLBP(finalPrice)}
                            </Text>
                          </View>
                          <View style={styles.cartItemDiscountBadge}>
                            <Text style={styles.cartItemDiscountText}>-{item.discount}%</Text>
                          </View>
                        </>
                      ) : (
                        <View style={{ flexDirection: 'column', gap: 2 }}>
                          <Text style={styles.cartItemPrice}>
                            ${item.price.toFixed(2)}
                          </Text>
                          <Text style={[styles.cartItemPrice, { fontSize: 11, color: '#6B7280' }]}>
                            {formatLBP(item.price)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.cartItemActions}>
                    <TouchableOpacity
                      style={styles.cartItemDeleteBtn}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>

                    <View style={styles.cartItemQuantityControl}>
                      <TouchableOpacity
                        style={[
                          styles.cartItemQuantityBtn,
                          item.quantity <= 1 && styles.cartItemQuantityBtnDisabled
                        ]}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Feather 
                          name="minus" 
                          size={14} 
                          color={item.quantity <= 1 ? '#9CA3AF' : '#374151'} 
                        />
                      </TouchableOpacity>
                      
                      <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                      
                      <TouchableOpacity
                        style={styles.cartItemQuantityBtn}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Feather name="plus" size={14} color="#374151" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="truck-delivery" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'عنوان التوصيل' : 'Shipping Address'}
            </Text>
          </View>

          {/* Saved Addresses Toggle */}
          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={styles.savedAddressToggle}
              onPress={() => setShowSavedAddresses(!showSavedAddresses)}
            >
              <View style={styles.savedAddressToggleLeft}>
                <MaterialCommunityIcons name="bookmark-multiple" size={22} color="#FF6B35" />
                <Text style={styles.savedAddressToggleText}>
                  {showSavedAddresses 
                    ? (language === 'ar' ? 'إخفاء' : 'Hide')
                    : (language === 'ar' ? 'استخدام' : 'Use')
                  } {language === 'ar' ? 'العناوين المحفوظة' : 'Saved Addresses'} ({savedAddresses.length})
                </Text>
              </View>
              <Feather name={showSavedAddresses ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Saved Addresses List */}
          {showSavedAddresses && savedAddresses.length > 0 && (
            <View style={styles.savedAddressesList}>
              {savedAddresses.map((savedAddr) => (
                <TouchableOpacity
                  key={savedAddr.id}
                  style={[
                    styles.savedAddressCard,
                    selectedSavedAddress?.id === savedAddr.id && styles.savedAddressCardSelected,
                  ]}
                  onPress={() => handleSelectSavedAddress(savedAddr)}
                >
                  <View style={styles.savedAddressIcon}>
                    <MaterialCommunityIcons 
                      name={savedAddr.label === 'Home' ? 'home' : savedAddr.label === 'Work' ? 'briefcase' : 'map-marker'}
                      size={20}
                      color={selectedSavedAddress?.id === savedAddr.id ? '#FF6B35' : '#6B7280'}
                    />
                  </View>
                  <View style={styles.savedAddressContent}>
                    <Text style={styles.savedAddressLabel}>{savedAddr.label || 'Address'}</Text>
                    <Text style={styles.savedAddressName}>{savedAddr.fullName}</Text>
                    <Text style={styles.savedAddressText} numberOfLines={2}>
                      {savedAddr.address}, {savedAddr.city}
                    </Text>
                    <Text style={styles.savedAddressPhone}>{savedAddr.phoneNumber}</Text>
                    {savedAddr.latitude && savedAddr.longitude && (
                      <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="map-marker-check" size={14} color="#10B981" />
                        <Text style={styles.verifiedText}>Location Verified</Text>
                      </View>
                    )}
                  </View>
                  {selectedSavedAddress?.id === savedAddr.id && (
                    <View style={styles.selectedCheckmark}>
                      <Feather name="check-circle" size={24} color="#FF6B35" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Manual Address Input */}
          {!showSavedAddresses && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {language === 'ar' ? 'العنوان *' : 'Address *'}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={language === 'ar' ? 'الشارع، المبنى، الشقة' : 'Street, building, apartment'}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

            </>
          )}

          {/* Location Picker Buttons */}
          <View style={styles.locationButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowAreaPicker(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker-radius" size={20} color="#FF6B35" />
              <Text style={styles.locationButtonText}>
                {language === 'ar' ? 'اختر المدينة' : 'Select City'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleOpenMaps}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#FF6B35" />
              <Text style={styles.locationButtonText}>
                {language === 'ar' ? 'اختر من الخريطة' : 'Pick on Map'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected City Display */}
          {selectedArea && (
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons name="map-marker-check" size={16} color="#10B981" />
              <Text style={styles.locationInfoText}>
                {language === 'ar' ? 'المدينة: ' : 'City: '}
                {language === 'ar' 
                  ? AREAS_LIST.find(a => a.name === selectedArea)?.nameAr 
                  : selectedArea}
              </Text>
            </View>
          )}

          {latitude && longitude && (
            <View style={styles.locationInfo}>
              <Feather name="map-pin" size={16} color="#10B981" />
              <Text style={styles.locationInfoText}>
                Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="credit-card" size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={styles.paymentLeft}>
              <MaterialCommunityIcons 
                name="cash" 
                size={24} 
                color={paymentMethod === 'cash' ? '#FF6B35' : '#6B7280'} 
              />
              <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>
                {language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'cash' && styles.radioActive]}>
              {paymentMethod === 'cash' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/card-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>
                {language === 'ar' ? 'بطاقة ائتمان/خصم' : 'Credit/Debit Card'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'card' && (
            <TouchableOpacity
              style={styles.cardDetailsButton}
              onPress={() => router.push('/payment/card' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="credit-card" size={20} color="#FF6B35" />
                <Text style={styles.cardDetailsText}>
                  {language === 'ar' ? 'إدخال بيانات البطاقة' : 'Enter Card Details'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#FF6B35" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'omt' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('omt')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/omt-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'omt' && styles.paymentTextActive]}>
                {language === 'ar' ? 'OMT' : 'OMT'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'omt' && styles.radioActive]}>
              {paymentMethod === 'omt' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'omt' && (
            <TouchableOpacity
              style={[styles.cardDetailsButton, styles.omtButton]}
              onPress={() => router.push('/payment/omt' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="smartphone" size={20} color="#FF6B00" />
                <Text style={[styles.cardDetailsText, { color: '#FF6B00' }]}>
                  {language === 'ar' ? 'الدفع عبر OMT' : 'Pay with OMT'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#FF6B00" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'whish' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('whish')}
          >
            <View style={styles.paymentLeft}>
              <Image
                source={require('@/assets/images/payment/whish-logo.png')}
                style={styles.paymentLogoImage}
                resizeMode="contain"
              />
              <Text style={[styles.paymentText, paymentMethod === 'whish' && styles.paymentTextActive]}>
                {language === 'ar' ? 'Whish Money' : 'Whish Money'}
              </Text>
            </View>
            <View style={[styles.radio, paymentMethod === 'whish' && styles.radioActive]}>
              {paymentMethod === 'whish' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === 'whish' && (
            <TouchableOpacity
              style={[styles.cardDetailsButton, styles.whishButton]}
              onPress={() => router.push('/payment/whish' as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardDetailsContent}>
                <Feather name="zap" size={20} color="#FF6B35" />
                <Text style={[styles.cardDetailsText, { color: '#FF6B35' }]}>
                  {language === 'ar' ? 'الدفع عبر Whish Money' : 'Pay with Whish Money'}
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="#FF6B35" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Bottom Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>
              {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
            </Text>
            <Text style={styles.bottomTotal}>{formatPrice(finalTotal)}</Text>
            <Text style={styles.bottomTotalLBP}>{formatLBP(finalTotal)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            activeOpacity={0.8}
            disabled={safeCartTotal < MINIMUM_ORDER_VALUE}
          >
            <LinearGradient
              colors={safeCartTotal < MINIMUM_ORDER_VALUE ? ['#9CA3AF', '#6B7280'] : ['#FF6B35', '#E63946']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}
            >
              <Text style={styles.placeOrderText}>
                {language === 'ar' ? 'إتمام الطلب' : 'Place Order'}
              </Text>
              <Feather name="check-circle" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelected={handleLocationSelected}
        initialLocation={latitude && longitude ? { latitude, longitude } : undefined}
      />

      {/* Area Picker Modal */}
      <Modal
        visible={showAreaPicker}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAreaPicker(false);
          setSelectedGovernorate(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.areaPickerModal}>
            <View style={styles.areaPickerHeader}>
              {selectedGovernorate && (
                <TouchableOpacity 
                  onPress={() => setSelectedGovernorate(null)}
                  style={{ marginRight: 8 }}
                >
                  <Feather name="arrow-left" size={24} color="#FF6B35" />
                </TouchableOpacity>
              )}
              <Text style={styles.areaPickerTitle}>
                {selectedGovernorate 
                  ? (language === 'ar' ? 'اختر المنطقة' : 'Select Area')
                  : (language === 'ar' ? 'اختر المحافظة' : 'Select Governorate')
                }
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAreaPicker(false);
                setSelectedGovernorate(null);
              }}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.areasList} showsVerticalScrollIndicator={false}>
              {!selectedGovernorate ? (
                // Show Governorates
                GOVERNORATES.map((gov) => (
                  <TouchableOpacity
                    key={gov.id}
                    style={[
                      styles.areaOption,
                      !gov.active && styles.areaOptionDisabled
                    ]}
                    onPress={() => {
                      if (gov.active) {
                        setSelectedGovernorate(gov.id);
                      }
                    }}
                    disabled={!gov.active}
                  >
                    <View style={styles.areaOptionContent}>
                      <MaterialCommunityIcons 
                        name="map" 
                        size={22} 
                        color={gov.active ? "#FF6B35" : "#D1D5DB"} 
                      />
                      <Text style={[
                        styles.areaOptionText,
                        !gov.active && styles.areaOptionTextDisabled
                      ]}>
                        {language === 'ar' ? gov.nameAr : gov.name}
                      </Text>
                      {gov.comingSoon && (
                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>
                            {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                          </Text>
                        </View>
                      )}
                    </View>
                    {gov.active && <Feather name="chevron-right" size={20} color="#6B7280" />}
                  </TouchableOpacity>
                ))
              ) : (
                // Show Areas in selected Governorate
                GOVERNORATES.find(g => g.id === selectedGovernorate)?.areas.map((area) => (
                  <TouchableOpacity
                    key={area.name}
                    style={[
                      styles.areaOption,
                      selectedArea === area.name && styles.areaOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedArea(area.name);
                      setCity(area.name);
                      setShowAreaPicker(false);
                      setSelectedGovernorate(null);
                    }}
                  >
                    <View style={styles.areaOptionContent}>
                      <MaterialCommunityIcons 
                        name="map-marker" 
                        size={20} 
                        color={selectedArea === area.name ? '#FF6B35' : '#6B7280'} 
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.areaOptionText,
                          selectedArea === area.name && styles.areaOptionTextSelected
                        ]}>
                          {language === 'ar' ? area.nameAr : area.name}
                        </Text>
                        <Text style={styles.areaPriceText}>
                          {language === 'ar' ? 'رسوم التوصيل: ' : 'Delivery: '}${area.price}
                        </Text>
                      </View>
                    </View>
                    {selectedArea === area.name && (
                      <Feather name="check" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  gradientHeader: {
    paddingBottom: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  backToStoreButtonHeader: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  backToStoreTextHeader: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  freeShippingBanner: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  freeShippingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  summaryValueLBP: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  totalValueLBP: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  locationButtons: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF5F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  locationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 6,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 12,
  },
  locationInfoText: {
    fontSize: 11,
    color: '#059669',
    marginLeft: 8,
    fontWeight: '500',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  paymentOptionActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogoImage: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 10,
  },
  paymentTextActive: {
    color: '#FF6B35',
  },
  cardDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  cardDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  omtButton: {
    borderColor: '#FFD7B5',
    backgroundColor: '#FFF7ED',
  },
  whishButton: {
    borderColor: '#FFDDC1',
    backgroundColor: '#FFF5F0',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#FF6B35',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B35',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 0,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  bottomLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  bottomTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  bottomTotalLBP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  placeOrderButton: {
    flex: 1,
    marginLeft: 12,
    maxWidth: '48%',
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  placeOrderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
  // Saved Addresses Styles
  savedAddressToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF5F0',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFDDC1',
  },
  savedAddressToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedAddressToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 10,
  },
  savedAddressesList: {
    marginBottom: 16,
  },
  savedAddressCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  savedAddressCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFFAF6',
  },
  savedAddressIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedAddressContent: {
    flex: 1,
  },
  savedAddressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  savedAddressName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  savedAddressText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 4,
    lineHeight: 18,
  },
  savedAddressPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 4,
  },
  selectedCheckmark: {
    marginLeft: 8,
  },
  // Area Picker Styles
  areaPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  areaPickerEmpty: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  areaPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  areaPickerText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  areaPickerPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  areaShippingBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaShippingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  areaPickerModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  areaPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  areaPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  areasList: {
    paddingHorizontal: 16,
  },
  areaOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFF',
  },
  areaOptionSelected: {
    backgroundColor: '#FFF5F0',
  },
  areaOptionDisabled: {
    opacity: 0.5,
  },
  areaOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  areaOptionText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  areaOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  areaOptionTextDisabled: {
    color: '#9CA3AF',
  },
  comingSoonBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  areaPriceText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  areaOptionPrice: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  areaOptionPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Cart Items Styles
  cartItemsList: {
    marginTop: 12,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    lineHeight: 18,
    marginBottom: 4,
  },
  cartItemWeight: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  cartItemOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through' as const,
  },
  cartItemDiscountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cartItemDiscountText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  cartItemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  cartItemDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cartItemQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cartItemQuantityBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  cartItemQuantityBtnDisabled: {
    opacity: 0.4,
  },
  cartItemQuantity: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    minWidth: 20,
    textAlign: 'center' as const,
    paddingHorizontal: 4,
  },
});
