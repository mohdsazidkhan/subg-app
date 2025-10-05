import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import API from '../../services/api';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import { showMessage } from 'react-native-flash-message';

const LevelsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await API.getLevels();
      
      if (response.success) {
        setLevels(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
        showMessage({
          message: 'Failed to load levels',
          type: 'danger',
        });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLevels();
    setRefreshing(false);
  };

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    changeLanguage(newLanguage);
  };

  const renderLevelCard = (level) => {
    const isCompleted = level.completedByUser;
    const isLocked = level.levelNumber > (level.unlockedAt || 1);

    return (
      <TouchableOpacity
        key={level._id}
        style={[
          styles.levelCard,
          { backgroundColor: colors.surface },
          isCompleted && { borderColor: colors.success, borderWidth: 2 },
          isLocked && { opacity: 0.6 }
        ]}
        onPress={() => {
          if (isLocked) {
            showMessage({
              message: 'This level is locked. Complete previous levels to unlock.',
              type: 'info',
            });
            return;
          }
          navigation.navigate('LevelDetail', { level });
        }}
      >
        <View style={styles.levelHeader}>
          <View style={[
            styles.levelIconContainer,
            { backgroundColor: isLocked ? colors.textSecondary : colors.primary }
          ]}>
            {isLocked ? (
              <Icon name="lock" size={24} color="white" />
            ) : (
              <Text style={styles.levelIcon}>{level.levelNumber}</Text>
            )}
          </View>
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={20} color={colors.success} />
            </View>
          )}
        </View>

        <Text style={[styles.levelName, { color: colors.text }]}>
          {level.name}
        </Text>
        
        <Text style={[styles.levelDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {level.description}
        </Text>

        <View style={styles.levelStats}>
          <View style={styles.statItem}>
            <Icon name="quiz" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {level.quizCount} quizzes
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="timer" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {level.estimatedTime} min
            </Text>
          </View>
        </View>

        {level.difficulty && (
          <View style={styles.difficultyContainer}>
            <Text style={[styles.difficultyText, { color: colors.textSecondary }]}>
              Difficulty: 
            </Text>
            <Text style={[
              styles.difficultyLevel,
              { color: level.difficulty === 'easy' ? colors.success : 
                     level.difficulty === 'medium' ? colors.warning : colors.error }
            ]}>
              {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
            </Text>
          </View>
        )}

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${level.userProgress || 0}%`
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(level.userProgress || 0)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <TopBar
          title={t('navigation.levels')}
          showBackButton={true}
          showLanguageToggle={true}
          onBackPress={() => navigation.goBack()}
          onLanguageToggle={handleLanguageToggle}
        />
        <Icon name="school" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('navigation.levels')}
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
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Icon name="school" size={40} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Learning Levels
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Progress through levels to unlock new content
            </Text>
          </View>
        </Card>

        {/* Levels Grid */}
        <View style={styles.levelsGrid}>
          {levels.map(renderLevelCard)}
        </View>

        {levels.length === 0 && (
        <Card style={styles.emptyState}>
          <View style={styles.emptyContent}>
            <Icon name="school" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Levels Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Levels will be added soon. Check back later!
            </Text>
          </View>
        </Card>
        )}
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
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 20,
    padding: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  levelsGrid: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  levelCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 14,
    marginRight: 8,
  },
  difficultyLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  emptyState: {
    margin: 20,
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LevelsScreen;