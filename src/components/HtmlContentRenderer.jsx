import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const HtmlContentRenderer = ({ content, style, textColor = '#000000' }) => {
  const { width } = useWindowDimensions();

  if (!content) return null;

  // Function to sanitize HTML content
  const sanitizeHtml = (html) => {
    if (!html) return '';
    
    // Remove potentially dangerous tags and attributes
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: protocols
    
    // Ensure proper line breaks
    sanitized = sanitized.replace(/\n/g, '<br />');
    
    return sanitized;
  };

  const processedContent = sanitizeHtml(content);

  // Only set text color based on theme - no other custom styles
  const tagsStyles = {
    body: { color: textColor },
    p: { color: textColor },
    h1: { color: textColor },
    h2: { color: textColor },
    h3: { color: textColor },
    h4: { color: textColor },
    h5: { color: textColor },
    h6: { color: textColor },
    span: { color: textColor },
    div: { color: textColor },
    li: { color: textColor },
    td: { color: textColor },
    th: { color: textColor },
  };

  // System fonts for better performance
  const systemFonts = ['System'];

  return (
    <View style={[styles.container, style]}>
      <RenderHtml
        contentWidth={width - 32} // Account for padding
        source={{ html: processedContent }}
        tagsStyles={tagsStyles}
        systemFonts={systemFonts}
        enableExperimentalMarginCollapsing={true}
        renderersProps={{
          img: {
            enableExperimentalPercentWidth: true,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HtmlContentRenderer;
