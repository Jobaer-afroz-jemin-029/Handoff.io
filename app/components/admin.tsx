import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Package,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productStore';

export default function AdminPanel() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, approveProduct, rejectProduct, fetchProducts, loading } =
    useProductStore();
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const pendingProducts = products.filter(
    (product) => product.status === 'pending'
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // Check loading state first
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      </View>
    );
  }

  // Check if user is admin - after loading check
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        <View style={styles.accessDenied}>
          <Shield size={64} color="#ef4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You need admin privileges to access this panel
          </Text>
        </View>
      </View>
    );
  }

  const handleApprove = async (productId: string) => {
    Alert.alert(
      'Approve Product',
      'Are you sure you want to approve this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            const success = await approveProduct(productId);
            if (success) {
              Alert.alert('Success', 'Product has been approved');
              onRefresh();
            } else {
              Alert.alert('Error', 'Failed to approve product');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (productId: string) => {
    Alert.alert(
      'Reject Product',
      'Are you sure you want to reject this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const success = await rejectProduct(productId);
            if (success) {
              Alert.alert('Success', 'Product has been rejected');
              onRefresh();
            } else {
              Alert.alert('Error', 'Failed to reject product');
            }
          },
        },
      ]
    );
  };

  const renderPendingProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>৳{item.price.toLocaleString()}</Text>
        <Text style={styles.productSeller}>By: {item.sellerName}</Text>
        <Text style={styles.productCategory}>
          {item.category} • {item.location}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item._id || item.id)}
          >
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item._id || item.id)}
          >
            <XCircle size={16} color="#fff" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      <View style={styles.adminInfo}>
        <Text style={styles.adminWelcome}>Welcome, {user.fullName}!</Text>
        <Text style={styles.adminDetails}>You have admin privileges</Text>
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tab}>
          <Package size={20} color="#1e40af" />
          <Text style={styles.tabText}>
            Pending Products ({pendingProducts.length})
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {pendingProducts.length > 0 ? (
          <FlatList
            data={pendingProducts}
            renderItem={renderPendingProduct}
            keyExtractor={(item) =>
              item._id || item.id || `product-${Math.random()}`
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Pending Products</Text>
            <Text style={styles.emptyDescription}>
              All products have been reviewed
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  adminInfo: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  adminWelcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  adminDetails: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  productSeller: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
