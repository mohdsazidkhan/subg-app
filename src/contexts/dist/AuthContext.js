'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.useAuth = exports.AuthProvider = void 0;
var react_1 = require('react');
var async_storage_1 = require('@react-native-async-storage/async-storage');
var react_native_flash_message_1 = require('react-native-flash-message');
var api_1 = require('../services/api');
var AuthContext = react_1.createContext(undefined);
exports.AuthProvider = function (_a) {
  var children = _a.children;
  var _b = react_1.useState(null),
    user = _b[0],
    setUser = _b[1];
  var _c = react_1.useState(false),
    isAuthenticated = _c[0],
    setIsAuthenticated = _c[1];
  var _d = react_1.useState(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  react_1.useEffect(function () {
    checkAuthStatus();
  }, []);
  var checkAuthStatus = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var token, userData, parsedUser, response, error_1, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, 11, 12]);
            return [4 /*yield*/, async_storage_1['default'].getItem('token')];
          case 1:
            token = _a.sent();
            return [4 /*yield*/, async_storage_1['default'].getItem('userInfo')];
          case 2:
            userData = _a.sent();
            if (!(token && userData)) return [3 /*break*/, 9];
            parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            _a.label = 3;
          case 3:
            _a.trys.push([3, 7, , 9]);
            return [4 /*yield*/, api_1['default'].getProfile()];
          case 4:
            response = _a.sent();
            if (!response.success) return [3 /*break*/, 6];
            setUser(response.user);
            return [
              4 /*yield*/,
              async_storage_1['default'].setItem('userInfo', JSON.stringify(response.user)),
            ];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 9];
          case 7:
            error_1 = _a.sent();
            // Token might be expired, logout
            return [4 /*yield*/, logout()];
          case 8:
            // Token might be expired, logout
            _a.sent();
            return [3 /*break*/, 9];
          case 9:
            return [3 /*break*/, 12];
          case 10:
            error_2 = _a.sent();
            console.error('Auth check error:', error_2);
            return [3 /*break*/, 12];
          case 11:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  var login = function (identifier, password, referralCode) {
    return __awaiter(void 0, void 0, Promise, function () {
      var response, error_3;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            return [
              4 /*yield*/,
              api_1['default'].login({
                identifier: identifier,
                password: password,
                referralCode: referralCode,
              }),
            ];
          case 1:
            response = _c.sent();
            if (!response.success) return [3 /*break*/, 4];
            return [4 /*yield*/, async_storage_1['default'].setItem('token', response.token)];
          case 2:
            _c.sent();
            return [
              4 /*yield*/,
              async_storage_1['default'].setItem('userInfo', JSON.stringify(response.user)),
            ];
          case 3:
            _c.sent();
            setUser(response.user);
            setIsAuthenticated(true);
            react_native_flash_message_1.showMessage({
              message: 'Login Successful!',
              type: 'success',
            });
            return [2 /*return*/, true];
          case 4:
            return [2 /*return*/, false];
          case 5:
            error_3 = _c.sent();
            react_native_flash_message_1.showMessage({
              message:
                ((_b = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data) ===
                  null || _b === void 0
                  ? void 0
                  : _b.message) || 'Login failed',
              type: 'danger',
            });
            return [2 /*return*/, false];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var register = function (userData) {
    return __awaiter(void 0, void 0, Promise, function () {
      var response, error_4;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            return [4 /*yield*/, api_1['default'].register(userData)];
          case 1:
            response = _c.sent();
            if (!response.success) return [3 /*break*/, 4];
            return [4 /*yield*/, async_storage_1['default'].setItem('token', response.token)];
          case 2:
            _c.sent();
            return [
              4 /*yield*/,
              async_storage_1['default'].setItem('userInfo', JSON.stringify(response.user)),
            ];
          case 3:
            _c.sent();
            setUser(response.user);
            setIsAuthenticated(true);
            react_native_flash_message_1.showMessage({
              message: 'Registration Successful!',
              type: 'success',
            });
            return [2 /*return*/, true];
          case 4:
            return [2 /*return*/, false];
          case 5:
            error_4 = _c.sent();
            react_native_flash_message_1.showMessage({
              message:
                ((_b = (_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) ===
                  null || _b === void 0
                  ? void 0
                  : _b.message) || 'Registration failed',
              type: 'danger',
            });
            return [2 /*return*/, false];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var googleLogin = function (googleData) {
    return __awaiter(void 0, void 0, Promise, function () {
      var response, error_5;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            return [4 /*yield*/, api_1['default'].googleAuth(googleData)];
          case 1:
            response = _c.sent();
            if (!response.success) return [3 /*break*/, 4];
            return [4 /*yield*/, async_storage_1['default'].setItem('token', response.token)];
          case 2:
            _c.sent();
            return [
              4 /*yield*/,
              async_storage_1['default'].setItem('userInfo', JSON.stringify(response.user)),
            ];
          case 3:
            _c.sent();
            setUser(response.user);
            setIsAuthenticated(true);
            react_native_flash_message_1.showMessage({
              message: 'Google Login Successful!',
              type: 'success',
            });
            return [2 /*return*/, true];
          case 4:
            return [2 /*return*/, false];
          case 5:
            error_5 = _c.sent();
            react_native_flash_message_1.showMessage({
              message:
                ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) ===
                  null || _b === void 0
                  ? void 0
                  : _b.message) || 'Google login failed',
              type: 'danger',
            });
            return [2 /*return*/, false];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var logout = function () {
    return __awaiter(void 0, void 0, Promise, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, async_storage_1['default'].removeItem('token')];
          case 1:
            _a.sent();
            return [4 /*yield*/, async_storage_1['default'].removeItem('userInfo')];
          case 2:
            _a.sent();
            setUser(null);
            setIsAuthenticated(false);
            react_native_flash_message_1.showMessage({
              message: 'Logged out successfully',
              type: 'info',
            });
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            console.error('Logout error:', error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateUser = function (userData) {
    if (user) {
      var updatedUser = __assign(__assign({}, user), userData);
      setUser(updatedUser);
      async_storage_1['default'].setItem('userInfo', JSON.stringify(updatedUser));
    }
  };
  var resetPassword = function (token, newPassword) {
    return __awaiter(void 0, void 0, Promise, function () {
      var response, error_7;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            return [4 /*yield*/, api_1['default'].resetPassword(token, newPassword)];
          case 1:
            response = _c.sent();
            if (response.success) {
              react_native_flash_message_1.showMessage({
                message: 'Password reset successful!',
                type: 'success',
              });
              return [2 /*return*/, true];
            }
            return [2 /*return*/, false];
          case 2:
            error_7 = _c.sent();
            react_native_flash_message_1.showMessage({
              message:
                ((_b = (_a = error_7.response) === null || _a === void 0 ? void 0 : _a.data) ===
                  null || _b === void 0
                  ? void 0
                  : _b.message) || 'Password reset failed',
              type: 'danger',
            });
            return [2 /*return*/, false];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var refreshUser = function () {
    return __awaiter(void 0, void 0, Promise, function () {
      var response, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, api_1['default'].getProfile()];
          case 1:
            response = _a.sent();
            if (!response.success) return [3 /*break*/, 3];
            setUser(response.user);
            return [
              4 /*yield*/,
              async_storage_1['default'].setItem('userInfo', JSON.stringify(response.user)),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_8 = _a.sent();
            console.error('Refresh user error:', error_8);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var value = {
    user: user,
    isAuthenticated: isAuthenticated,
    isLoading: isLoading,
    login: login,
    register: register,
    googleLogin: googleLogin,
    resetPassword: resetPassword,
    logout: logout,
    updateUser: updateUser,
    refreshUser: refreshUser,
  };
  return react_1['default'].createElement(AuthContext.Provider, { value: value }, children);
};
exports.useAuth = function () {
  var context = react_1.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
