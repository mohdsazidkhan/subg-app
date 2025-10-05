'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
exports.__esModule = true;
var react_1 = require('react');
var react_native_1 = require('react-native');
var native_1 = require('@react-navigation/native');
var react_i18next_1 = require('react-i18next');
var MaterialIcons_1 = require('react-native-vector-icons/MaterialIcons');
var AuthContext_1 = require('../../contexts/AuthContext');
var ThemeContext_1 = require('../../contexts/ThemeContext');
var LanguageContext_1 = require('../../contexts/LanguageContext');
var TopBar_1 = require('../../components/TopBar');
var Card_1 = require('../../components/Card');
var Button_1 = require('../../components/Button');
var ProfileScreen = function () {
  var _a;
  var navigation = native_1.useNavigation();
  var _b = AuthContext_1.useAuth(),
    user = _b.user,
    logout = _b.logout;
  var _c = ThemeContext_1.useTheme(),
    colors = _c.colors,
    toggleTheme = _c.toggleTheme;
  var t = react_i18next_1.useTranslation().t;
  var _d = LanguageContext_1.useLanguage(),
    currentLanguage = _d.currentLanguage,
    changeLanguage = _d.changeLanguage;
  var _e = react_1.useState({
      quizzesCompleted: 0,
      totalScore: 0,
      rank: 0,
      achievements: 0,
    }),
    profileStats = _e[0],
    _setProfileStats = _e[1];
  var handleLanguageToggle = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var newLanguage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            newLanguage = currentLanguage === 'en' ? 'hi' : 'en';
            return [4 /*yield*/, changeLanguage(newLanguage)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  var handleLogout = function () {
    react_native_1.Alert.alert(t('profile.logout'), 'Are you sure you want to logout?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: function () {
          return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, logout()];
                case 1:
                  _a.sent();
                  navigation.navigate('Auth');
                  return [2 /*return*/];
              }
            });
          });
        },
      },
    ]);
  };
  var menuItems = [
    {
      title: t('profile.editProfile'),
      icon: 'edit',
      onPress: function () {
        // Navigate to edit profile
      },
    },
    {
      title: t('profile.quizHistory'),
      icon: 'history',
      onPress: function () {
        // Navigate to quiz history
      },
    },
    {
      title: t('profile.achievements'),
      icon: 'emoji-events',
      onPress: function () {
        // Navigate to achievements
      },
    },
    {
      title: t('navigation.settings'),
      icon: 'settings',
      onPress: function () {
        // Navigate to settings
      },
    },
    {
      title: t('profile.about'),
      icon: 'info',
      onPress: function () {
        // Navigate to about
      },
    },
    {
      title: t('profile.contact'),
      icon: 'contact-support',
      onPress: function () {
        // Navigate to contact
      },
    },
  ];
  return react_1['default'].createElement(
    react_native_1.View,
    { style: [styles.container, { backgroundColor: colors.background }] },
    react_1['default'].createElement(TopBar_1['default'], {
      title: t('navigation.profile'),
      showMenuButton: true,
      showLanguageToggle: true,
      showThemeToggle: true,
      onMenuPress: function () {
        return navigation.navigate('MainTabs', { screen: 'More' });
      },
      onLanguageToggle: handleLanguageToggle,
      onThemeToggle: toggleTheme,
    }),
    react_1['default'].createElement(
      react_native_1.ScrollView,
      { style: styles.scrollView, showsVerticalScrollIndicator: false },
      react_1['default'].createElement(
        Card_1['default'],
        { style: styles.profileHeader },
        react_1['default'].createElement(
          react_native_1.View,
          { style: styles.avatarContainer },
          react_1['default'].createElement(
            react_native_1.View,
            { style: [styles.avatar, { backgroundColor: colors.primary + '20' }] },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'person',
              size: 40,
              color: colors.primary,
            })
          ),
          react_1['default'].createElement(
            react_native_1.TouchableOpacity,
            { style: styles.editAvatarButton },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'camera-alt',
              size: 16,
              color: 'white',
            })
          )
        ),
        react_1['default'].createElement(
          react_native_1.Text,
          { style: [styles.userName, { color: colors.text }] },
          (user === null || user === void 0 ? void 0 : user.name) || 'User'
        ),
        react_1['default'].createElement(
          react_native_1.Text,
          { style: [styles.userEmail, { color: colors.textSecondary }] },
          (user === null || user === void 0 ? void 0 : user.email) || 'user@example.com'
        ),
        react_1['default'].createElement(
          react_native_1.View,
          { style: [styles.subscriptionBadge, { backgroundColor: colors.primary }] },
          react_1['default'].createElement(
            react_native_1.Text,
            { style: styles.subscriptionText },
            ((_a = user === null || user === void 0 ? void 0 : user.subscriptionStatus) === null ||
            _a === void 0
              ? void 0
              : _a.toUpperCase()) || 'FREE'
          )
        ),
        (user === null || user === void 0 ? void 0 : user.subscriptionExpiry) &&
          (user === null || user === void 0 ? void 0 : user.subscriptionStatus) !== 'free' &&
          react_1['default'].createElement(
            react_native_1.Text,
            { style: [styles.subscriptionExpiry, { color: colors.textSecondary }] },
            'Expires: ',
            new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          ),
        react_1['default'].createElement(
          react_native_1.TouchableOpacity,
          {
            style: [styles.upgradeButton, { backgroundColor: colors.primary }],
            onPress: function () {
              return navigation.navigate('Subscription');
            },
          },
          react_1['default'].createElement(MaterialIcons_1['default'], {
            name:
              (user === null || user === void 0 ? void 0 : user.subscriptionStatus) === 'free'
                ? 'rocket-launch'
                : 'settings',
            size: 16,
            color: 'white',
          }),
          react_1['default'].createElement(
            react_native_1.Text,
            { style: styles.upgradeButtonText },
            (user === null || user === void 0 ? void 0 : user.subscriptionStatus) === 'free'
              ? 'Upgrade Plan'
              : 'Manage Subscription'
          )
        )
      ),
      react_1['default'].createElement(
        Card_1['default'],
        { style: styles.statsContainer },
        react_1['default'].createElement(
          react_native_1.Text,
          { style: [styles.sectionTitle, { color: colors.text }] },
          'Your Stats'
        ),
        react_1['default'].createElement(
          react_native_1.View,
          { style: styles.statsGrid },
          react_1['default'].createElement(
            react_native_1.View,
            { style: styles.statItem },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'quiz',
              size: 24,
              color: colors.primary,
            }),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statNumber, { color: colors.text }] },
              profileStats.quizzesCompleted
            ),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statLabel, { color: colors.textSecondary }] },
              'Quizzes'
            )
          ),
          react_1['default'].createElement(
            react_native_1.View,
            { style: styles.statItem },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'star',
              size: 24,
              color: colors.primary,
            }),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statNumber, { color: colors.text }] },
              profileStats.totalScore
            ),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statLabel, { color: colors.textSecondary }] },
              'Score'
            )
          ),
          react_1['default'].createElement(
            react_native_1.View,
            { style: styles.statItem },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'leaderboard',
              size: 24,
              color: colors.primary,
            }),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statNumber, { color: colors.text }] },
              '#',
              profileStats.rank || '--'
            ),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statLabel, { color: colors.textSecondary }] },
              'Rank'
            )
          ),
          react_1['default'].createElement(
            react_native_1.View,
            { style: styles.statItem },
            react_1['default'].createElement(MaterialIcons_1['default'], {
              name: 'emoji-events',
              size: 24,
              color: colors.primary,
            }),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statNumber, { color: colors.text }] },
              profileStats.achievements
            ),
            react_1['default'].createElement(
              react_native_1.Text,
              { style: [styles.statLabel, { color: colors.textSecondary }] },
              'Awards'
            )
          )
        )
      ),
      react_1['default'].createElement(
        react_native_1.View,
        { style: styles.menuContainer },
        menuItems.map(function (item, index) {
          return react_1['default'].createElement(
            Card_1['default'],
            { key: index, style: styles.menuItem, onPress: item.onPress },
            react_1['default'].createElement(
              react_native_1.View,
              { style: styles.menuItemContent },
              react_1['default'].createElement(MaterialIcons_1['default'], {
                name: item.icon,
                size: 24,
                color: colors.primary,
              }),
              react_1['default'].createElement(
                react_native_1.Text,
                { style: [styles.menuItemText, { color: colors.text }] },
                item.title
              ),
              react_1['default'].createElement(MaterialIcons_1['default'], {
                name: 'chevron-right',
                size: 24,
                color: colors.textSecondary,
              })
            )
          );
        })
      ),
      react_1['default'].createElement(
        Card_1['default'],
        { style: styles.logoutContainer },
        react_1['default'].createElement(Button_1['default'], {
          title: t('profile.logout'),
          onPress: handleLogout,
          variant: 'outline',
          icon: react_1['default'].createElement(MaterialIcons_1['default'], {
            name: 'logout',
            size: 20,
            color: colors.error,
          }),
          style: styles.logoutButton,
          textStyle: { color: colors.error },
        })
      ),
      react_1['default'].createElement(
        react_native_1.View,
        { style: styles.appInfo },
        react_1['default'].createElement(
          react_native_1.Text,
          { style: [styles.appVersion, { color: colors.textSecondary }] },
          t('profile.version'),
          ': 1.0.0'
        ),
        react_1['default'].createElement(
          react_native_1.Text,
          { style: [styles.appName, { color: colors.textSecondary }] },
          'SUBG Quiz App'
        )
      )
    )
  );
};
var styles = react_native_1.StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    margin: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 15,
  },
  subscriptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  subscriptionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subscriptionExpiry: {
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 15,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuContainer: {
    marginHorizontal: 15,
  },
  menuItem: {
    marginBottom: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuItemText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 15,
  },
  logoutContainer: {
    margin: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButton: {
    borderColor: '#DC3545',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appVersion: {
    fontSize: 12,
    marginBottom: 5,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
  },
});
exports['default'] = ProfileScreen;
