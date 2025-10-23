import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';
import offlineService from '../services/offline';

interface Letter {
  id: string;
  title: string;
  book: number;
  letterNumber: number;
  isCompleted: boolean;
  isLocked: boolean;
  summary: string;
}

interface LettersScreenProps {
  navigation: any;
}

const LettersScreen: React.FC<LettersScreenProps> = ({ navigation }) => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    loadLetters();
    
    // Subscribe to auth state changes
    const authUnsubscribe = authService.subscribe((state) => {
      setUser(state.user);
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  const loadLetters = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      if (offlineService.isOnline()) {
        const response = await fetch('/api/letters');
        if (response.ok) {
          const data = await response.json();
          setLetters(data);
          return;
        }
      }
      
      // Fallback to offline storage
      const cachedLetters = await offlineService.getCachedData('letters');
      if (cachedLetters) {
        setLetters(cachedLetters);
      }
    } catch (error) {
      console.error('Error loading letters:', error);
      Alert.alert('Error', 'Failed to load letters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLetters();
    setRefreshing(false);
  };

  const handleLetterPress = (letter: Letter) => {
    if (letter.isLocked) {
      Alert.alert(
        'Letter Locked',
        'Complete the previous letters to unlock this one.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('LetterDetail', { letterId: letter.id });
  };

  const getBookColor = (book: number) => {
    const colors = ['#00ff88', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    return colors[(book - 1) % colors.length];
  };

  const renderLetter = ({ item: letter }: { item: Letter }) => {
    const bookColor = getBookColor(letter.book);
    
    return (
      <TouchableOpacity
        style={[
          styles.letterCard,
          letter.isCompleted && styles.completedCard,
          letter.isLocked && styles.lockedCard,
        ]}
        onPress={() => handleLetterPress(letter)}
        disabled={letter.isLocked}
      >
        <LinearGradient
          colors={letter.isCompleted ? [`${bookColor}20`, `${bookColor}10`] : ['#111111', '#000000']}
          style={styles.letterCardGradient}
        >
          <View style={styles.letterHeader}>
            <View style={styles.letterNumberContainer}>
              <Text style={[styles.letterNumber, { color: bookColor }]}>
                {letter.letterNumber}
              </Text>
            </View>
            
            <View style={styles.letterInfo}>
              <Text style={styles.letterTitle}>{letter.title}</Text>
              <Text style={styles.letterBook}>Book {letter.book}</Text>
            </View>
            
            <View style={styles.letterStatus}>
              {letter.isCompleted ? (
                <Icon name="check-circle" size={24} color={bookColor} />
              ) : letter.isLocked ? (
                <Icon name="lock" size={24} color="#666666" />
              ) : (
                <Icon name="play-circle" size={24} color="#00ff88" />
              )}
            </View>
          </View>
          
          <Text style={styles.letterSummary} numberOfLines={2}>
            {letter.summary}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderBookSection = (bookNumber: number) => {
    const bookLetters = letters.filter(letter => letter.book === bookNumber);
    if (bookLetters.length === 0) return null;

    const bookColor = getBookColor(bookNumber);
    const completedCount = bookLetters.filter(letter => letter.isCompleted).length;
    const progress = (completedCount / bookLetters.length) * 100;

    return (
      <View key={bookNumber} style={styles.bookSection}>
        <View style={styles.bookHeader}>
          <View style={styles.bookTitleContainer}>
            <Icon name="menu-book" size={20} color={bookColor} />
            <Text style={[styles.bookTitle, { color: bookColor }]}>
              Book {bookNumber}
            </Text>
          </View>
          
          <Text style={styles.bookProgress}>
            {completedCount}/{bookLetters.length}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: bookColor }
            ]}
          />
        </View>
        
        <FlatList
          data={bookLetters}
          renderItem={renderLetter}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const books = Array.from(new Set(letters.map(letter => letter.book))).sort();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="menu-book" size={48} color="#00ff88" />
        <Text style={styles.loadingText}>Loading Letters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={({ item: bookNumber }) => renderBookSection(bookNumber)}
        keyExtractor={(item) => `book-${item}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
            colors={['#00ff88']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  bookSection: {
    marginBottom: 24,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bookProgress: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  letterCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completedCard: {
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  lockedCard: {
    opacity: 0.6,
  },
  letterCardGradient: {
    padding: 16,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  letterNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterNumber: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  letterInfo: {
    flex: 1,
  },
  letterTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  letterBook: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  letterStatus: {
    marginLeft: 12,
  },
  letterSummary: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});

export default LettersScreen;
