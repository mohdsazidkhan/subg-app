import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { showMessage } from 'react-native-flash-message';

const LevelDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();

  const [level, setLevel] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const levelId = route.params?.levelId;

  useEffect(() => {
    if (levelId) {
      fetchLevelData();
    }
  }, [levelId]);

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLevel(),
        fetchQuizzes(),
      ]);
    } catch (error) {
      console.error('Error fetching level data:', error);
      showMessage({
        message: 'Failed to load level data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLevel = async () => {
    try {
      const response = await API.getAllLevels();
      if (response.success) {
        const foundLevel = response.data.find((l) => l._id === levelId);
        if (foundLevel) {
          setLevel(foundLevel);
        }
      }
    } catch (error) {
      console.error('Error fetching level:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await API.getLevelBasedQuizzes({ levelId });
      if (response.success) {
        setQuizzes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLevelData();
    setRefreshing(false);
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    await changeLanguage(newLanguage);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getLevelIcon = (levelNumber) => {
    const icons = [
      'star',
      'rocket-launch',
      'psychology',
      'trending-up',
      'emoji-events',
      'diamond',
      'workspace-premium',
      'auto-awesome',
      'auto-fix-high',
      'celebration'
    ];
    return icons[levelNumber - 1] || 'star';
  };

  const renderQuizCard = (quiz) => (
    <Card key={quiz._id} style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <View style={styles.quizTitleContainer}>
          <Text
            style={[styles.quizTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {quiz.title}
          </Text>
          {quiz.isCompleted && (
            <Icon name="check-circle" size={20} color={colors.success} />
          )}
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }
          ]}
        >
          <Text
            style={[
              styles.difficultyText,
              { color: getDifficultyColor(quiz.difficulty) }
            ]}
          >
            {quiz.difficulty}
          </Text>
        </View>
      </View>

      {quiz.description && (
        <Text
          style={[styles.quizDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {quiz.description}
        </Text>
      )}

      <View style={styles.quizInfo}>
        <View style={styles.quizInfoItem}>
          <Icon name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
            {quiz.timeLimit || 30}m
          </Text>
        </View>

        <View style={styles.quizInfoItem}>
          <Icon name="quiz" size={16} color={colors.textSecondary} />
          <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
            {quiz.totalMarks} Q
          </Text>
        </View>

        {quiz.bestScore && (
          <View style={styles.quizInfoItem}>
            <Icon name="star" size={16} color={colors.warning} />
            <Text style={[styles.quizInfoText, { color: colors.warning }]}>
              {quiz.bestScore}%
            </Text>
          </View>
        )}
      </View>

      <Button
        title={quiz.isCompleted ? 'Retake' : 'Start Quiz'}
        onPress={() => navigation.navigate('Quiz', { quizId: quiz._id })}
        variant={quiz.isCompleted ? 'outline' : 'primary'}
        style={styles.quizButton}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Level Details"
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="star" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!level) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title="Level Details"
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="error" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Level not found
        </Text>
        <Button title="Back" onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={`Level ${level.level}`}
        showBackButton={true}
        showLanguageToggle={true}
        onBackPress={() => navigation.goBack()}
        onLanguageToggle={handleLanguageToggle}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Level Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.levelHeader}
        >
          <View style={styles.levelHeaderContent}>
            <Icon name={getLevelIcon(level.level)} size={60} color="white" />
            <Text style={styles.levelNumber}>Level {level.level}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
            <Text style={styles.levelDescription}>{level.description}</Text>

            <View style={styles.levelStats}>
              <View style={styles.levelStatItem}>
                <Icon name="quiz" size={20} color="white" />
                <Text style={styles.levelStatText}>{level.quizCount} Quizzes</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quizzes Section */}
        <View style={styles.quizzesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Quizzes ({quizzes.length})
          </Text>

            {quizzes.length > 0 ? (
            <View style={styles.quizzesContainer}>
              {quizzes.map(renderQuizCard)}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="quiz" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No quizzes available for this level
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  levelHeader: {
    padding: 30,
    alignItems: 'center',
  },
  levelHeaderContent: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  levelDescription: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 20,
  },
  levelStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelStatText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  quizzesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  quizzesContainer: {
    paddingHorizontal: 20,
  },
  quizCard: {
    marginBottom: 16,
    padding: 20,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  quizDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  quizInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  quizInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizInfoText: {
    fontSize: 14,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizButton: {
    marginTop: 12,
  },
  emptyCard: {
    margin: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LevelDetailScreen;