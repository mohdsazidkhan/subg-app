import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

const TranslatableText = ({ children, style, numberOfLines }) => {
  const { currentLanguage, translateDynamic } = useLanguage();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    let mounted = true;
    const doTranslate = async () => {
      if (typeof children === 'string') {
        const out = await translateDynamic(children);
        if (mounted) setTranslated(out);
      } else {
        setTranslated(children);
      }
    };
    doTranslate();
    return () => {
      mounted = false;
    };
  }, [children, currentLanguage, translateDynamic]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {translated}
    </Text>
  );
};

export default TranslatableText;


