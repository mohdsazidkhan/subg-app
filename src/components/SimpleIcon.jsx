import React from 'react';
import { Text } from 'react-native';

const SimpleIcon = ({ name, size = 24, color = '#000' }) => {
  // Simple fallback for vector icons
  const iconMap = {
    'home': '🏠',
    'search': '🔍',
    'person': '👤',
    'menu': '☰',
    'arrow-back': '←',
    'light-mode': '☀️',
    'dark-mode': '🌙',
    'quiz': '📝',
    'add-circle': '+',
    'workspace-premium': '💎',
    'library-books': '📚',
    'help': '❓',
    'chevron-right': '>',
    'school': '🎓',
    'group': '👥',
    'book': '📖',
    'category': '📂',
    'help-outline': '❔',
    'emoji-events': '🏆',
    'calculate': '🧮',
    'history-edu': '📚',
    'science': '🔬',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '?'}
    </Text>
  );
};

export default SimpleIcon;
