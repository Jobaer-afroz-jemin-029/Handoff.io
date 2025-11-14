import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Star, MapPin } from 'lucide-react-native';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getProductById } = useProductStore();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = getProductById(id as string);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const averageRating = product.ratings.length > 0
    ? product.ratings.reduce((sum, rating) => sum + rating.rating, 0) / product.ratings.length
    : 0;

  const handleChatWithSeller = async () => {
    if (product.sellerId === user?.varsityId) {
      Alert.alert('Info', 'This is your own product');
      return;
    }

    try {
      // Fetch seller's phone number
      const API_BASE_URL = 'https://handoff-backend.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/user/varsity/${product.sellerVarsityId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch seller information: ${response.status}`);
      }

      const sellerData = await response.json();
      console.log('Seller data fetched:', sellerData);
      
      if (!sellerData.phoneNumber || !sellerData.phoneNumber.trim()) {
        Alert.alert(
          'Phone Number Not Available',
          'The seller has not added their phone number. Please contact them through other means.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Clean phone number - remove any non-digit characters except +
      let phoneNumber = sellerData.phoneNumber.trim().replace(/[^\d+]/g, '');
      
      // If phone number doesn't start with +, assume it's a local number
      // For WhatsApp, we need the number in international format
      // If it starts with 0, replace with country code (Bangladesh is +880)
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+880' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        // If no country code, assume Bangladesh (+880)
        phoneNumber = '+880' + phoneNumber;
      }
      
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert(
          'Invalid Phone Number',
          'The seller\'s phone number format is invalid. Please contact them through other means.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Open WhatsApp chat with the phone number
      // WhatsApp URL format: https://wa.me/PHONENUMBER or whatsapp://send?phone=PHONENUMBER
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}`;
      
      console.log('Opening WhatsApp chat for:', phoneNumber);
      console.log('URL:', whatsappUrl);
      
      try {
        // Try to open WhatsApp
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
          console.log('Successfully opened WhatsApp');
        } else {
          // Fallback to alternative WhatsApp URL format
          const altUrl = `whatsapp://send?phone=${phoneNumber.replace(/[^\d]/g, '')}`;
          await Linking.openURL(altUrl);
        }
      } catch (error) {
        console.error('Failed to open WhatsApp:', error);
        Alert.alert(
          'Unable to Open WhatsApp',
          'Could not open WhatsApp. Please make sure WhatsApp is installed on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error opening WhatsApp chat:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to open WhatsApp chat. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRateSeller = () => {
    if (product.sellerId === user?.varsityId) {
      Alert.alert('Info', 'You cannot rate your own product');
      return;
    }
    router.push(`/rating/${product.sellerId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {product.images.map((image, index) => (
            <Image
              key={`${image}-${index}`}
              source={{ uri: image }}
              style={[styles.productImage, { width }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        <View style={styles.imageIndicators}>
          {product.images.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[
                styles.indicator,
                currentImageIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>৳{product.price.toLocaleString()}</Text>
        </View>

        <View style={styles.categoryLocation}>
          <Text style={styles.category}>{product.category}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.location}>{product.location}</Text>
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        <View style={styles.sellerInfo}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>{product.sellerName}</Text>
            <Text style={styles.sellerVarsityId}>ID: {product.sellerVarsityId}</Text>
            {averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.ratingText}>
                  {averageRating.toFixed(1)} ({product.ratings.length} reviews)
                </Text>
              </View>
            )}
          </View>
        </View>

        {product.ratings.length > 0 && (
          <View style={styles.ratingsSection}>
            <Text style={styles.sectionTitle}>Seller Ratings</Text>
            {product.ratings.slice(0, 3).map((rating,index) => (
              <View key={rating.id ?? index.toString()} style={styles.ratingItem}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.ratingBuyerName}>{rating.buyerName}</Text>
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        color={index < rating.rating ? '#fbbf24' : '#d1d5db'}
                        fill={index < rating.rating ? '#fbbf24' : 'none'}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.ratingComment}>{rating.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleChatWithSeller}
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Chat with Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rateButton}
            onPress={handleRateSeller}
          >
            <Star size={20} color="#1e40af" />
            <Text style={styles.rateButtonText}>Rate Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  productHeader: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  categoryLocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  description: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  sellerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sellerDetails: {},
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  sellerVarsityId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 4,
  },
  ratingsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBuyerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingComment: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#1e40af',
  },
  rateButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});