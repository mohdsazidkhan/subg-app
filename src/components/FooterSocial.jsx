import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '../contexts/ThemeContext';
import { SOCIAL_LINKS } from '../config/env';

const DEFAULT_LINKS = {
  instagram: SOCIAL_LINKS.INSTAGRAM_URL,
  facebook: SOCIAL_LINKS.FACEBOOK_URL,
  x: SOCIAL_LINKS.X_URL,
  youtube: SOCIAL_LINKS.YOUTUBE_URL,
  linkedin: SOCIAL_LINKS.LINKEDIN_URL,
  whatsapp: SOCIAL_LINKS.WHATSAPP_URL,
  discord: SOCIAL_LINKS.DISCORD_URL,
  telegram: SOCIAL_LINKS.TELEGRAM_URL,
};

const FooterSocial = ({ links = DEFAULT_LINKS }) => {
  const { colors } = useTheme();

  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('URL cannot be opened:', error);
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        accessibilityLabel="Instagram"
        style={styles.iconButton}
        onPress={() => openUrl(links.instagram || DEFAULT_LINKS.instagram)}
        activeOpacity={0.7}
      >
        <MCIcon name="instagram" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Facebook"
        style={styles.iconButton}
        onPress={() => openUrl(links.facebook || DEFAULT_LINKS.facebook)}
        activeOpacity={0.7}
      >
        <MCIcon name="facebook" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="X"
        style={styles.iconButton}
        onPress={() => openUrl(links.x || DEFAULT_LINKS.x)}
        activeOpacity={0.7}
      >
        <MCIcon name="twitter" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="YouTube"
        style={styles.iconButton}
        onPress={() => openUrl(links.youtube || DEFAULT_LINKS.youtube)}
        activeOpacity={0.7}
      >
        <MCIcon name="youtube" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="LinkedIn"
        style={styles.iconButton}
        onPress={() => openUrl(links.linkedin || DEFAULT_LINKS.linkedin)}
        activeOpacity={0.7}
      >
        <MCIcon name="linkedin" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="WhatsApp"
        style={styles.iconButton}
        onPress={() => openUrl(links.whatsapp || DEFAULT_LINKS.whatsapp)}
        activeOpacity={0.7}
      >
        <MCIcon name="whatsapp" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Discord"
        style={styles.iconButton}
        onPress={() => openUrl(links.discord || DEFAULT_LINKS.discord)}
        activeOpacity={0.7}
      >
        <MCIcon name="discord" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityLabel="Telegram"
        style={styles.iconButton}
        onPress={() => openUrl(links.telegram || DEFAULT_LINKS.telegram)}
        activeOpacity={0.7}
      >
        <FAIcon name="telegram" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default FooterSocial;