import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';

export default function RatingSeller() {
  const { sellerId } = useLocalSearchParams();
  const router = useRouter();
  const { addRating } = useProductStore();
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // In a real app, you'd get seller info from a store
  const sellerName = sellerId === '22235103001' ? 'John Doe' : 'Jane Smith';

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setLoading(true);
    try {
      // Find a product by this seller to add rating to
      // In a real app, you'd have a better way to handle this
      const ratingData = {
        buyerId: user?.varsityId || '',
        buyerName: user?.fullName || '',
        rating: rating,
        comment: comment.trim(),
      };

      // For demo purposes, we'll add to the first product by this seller
      // In reality, you'd add to the specific product that was purchased
      Alert.alert(
        'Success', 
        'Your rating has been submitted!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={40}
              color={star <= rating ? '#fbbf24' : '#d1d5db'}
              fill={star <= rating ? '#fbbf24' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Seller</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerLabel}>Rating for:</Text>
          <Text style={styles.sellerName}>{sellerName}</Text>
          <Text style={styles.sellerNote}>
            Only rate sellers after completing a transaction
          </Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          {renderStars()}
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>Write a comment</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with other buyers..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.characterCount}>
            {comment.length}/200 characters
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || rating === 0) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitRating}
          disabled={loading || rating === 0}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Text>
        </TouchableOpacity>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 Your rating helps other students make informed decisions when buying from this seller.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flexGrow: 1,
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
  form: {
    padding: 16,
  },
  sellerInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sellerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sellerNote: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
  },
  commentSection: {
    backgroundColor: '#fff',
    padding: 20,
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
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1e40af',
  },
  noteText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});