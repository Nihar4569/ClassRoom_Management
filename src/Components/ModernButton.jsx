// File location: src/Components/ModernButton.jsx
import React from 'react';
import { Button, useTheme } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

function ModernButton({ children, colorScheme = "blue", onClick, variant = "solid", isDisabled, type, size="md", leftIcon, rightIcon, ...props }) {
  const theme = useTheme();
  
  // Define the glow color based on the colorScheme
  const getGlowColor = () => {
    switch (colorScheme) {
      case 'blue':
        return theme.colors.blue[200];
      case 'red':
        return theme.colors.red[200];
      case 'green':
        return theme.colors.green[200];
      case 'purple':
        return theme.colors.purple[200];
      default:
        return theme.colors.blue[200];
    }
  };

  return (
    <MotionButton
      as="button"
      colorScheme={colorScheme}
      onClick={onClick}
      variant={variant}
      isDisabled={isDisabled}
      type={type}
      size={size}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 8px ${getGlowColor()}`,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      borderRadius="lg"
      fontWeight="semibold"
      {...props}
    >
      {children}
    </MotionButton>
  );
}

export default ModernButton;