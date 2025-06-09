
export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export const getCategoryInfo = (categoryId: string): CategoryInfo => {
  // Handle numbered categories (legacy support)
  const numberedCategories: { [key: string]: CategoryInfo } = {
    '1': { name: 'Food & Dining', icon: '🍽️', color: '#FF4081' },
    '2': { name: 'Transportation', icon: '🚗', color: '#00BCD4' },
    '3': { name: 'Entertainment', icon: '🎮', color: '#FF5722' },
    '4': { name: 'Bills & Utilities', icon: '⚡', color: '#FFC107' },
    '5': { name: 'Shopping', icon: '🛒', color: '#9C27B0' },
    '6': { name: 'Fuel', icon: '⛽', color: '#FF9800' },
    '7': { name: 'Salary', icon: '💰', color: '#4CAF50' },
    '8': { name: 'Freelance', icon: '💼', color: '#2196F3' },
  };

  // If it's a numbered category, use the mapping
  if (numberedCategories[categoryId]) {
    return numberedCategories[categoryId];
  }

  // Handle string category names directly
  const stringCategoryMapping: { [key: string]: CategoryInfo } = {
    'food': { name: 'Food & Dining', icon: '🍽️', color: '#FF4081' },
    'entertainment': { name: 'Entertainment', icon: '🎮', color: '#FF5722' },
    'fuel': { name: 'Fuel', icon: '⛽', color: '#FF9800' },
    'rental income': { name: 'Rental Income', icon: '🏠', color: '#009688' },
    'transportation': { name: 'Transportation', icon: '🚗', color: '#00BCD4' },
    'shopping': { name: 'Shopping', icon: '🛒', color: '#9C27B0' },
    'bills': { name: 'Bills & Utilities', icon: '⚡', color: '#FFC107' },
    'healthcare': { name: 'Healthcare', icon: '🏥', color: '#E91E63' },
    'education': { name: 'Education', icon: '📚', color: '#3F51B5' },
    'travel': { name: 'Travel', icon: '✈️', color: '#795548' },
    'personal care': { name: 'Personal Care', icon: '💅', color: '#607D8B' },
    'groceries': { name: 'Groceries', icon: '🛍️', color: '#8BC34A' },
    'salary': { name: 'Salary', icon: '💰', color: '#4CAF50' },
    'freelance': { name: 'Freelance', icon: '💼', color: '#2196F3' },
  };

  // Check if it's a known string category
  const lowerCaseCategory = categoryId.toLowerCase();
  if (stringCategoryMapping[lowerCaseCategory]) {
    return stringCategoryMapping[lowerCaseCategory];
  }

  // If it's a UUID or unknown category, return a cleaned up version or "Other"
  if (categoryId.length > 20) {
    // Likely a UUID, return "Other"
    return { name: 'Other', icon: '💳', color: '#9E9E9E' };
  }

  // Capitalize first letter for unknown but short category names
  const displayName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  return { name: displayName, icon: '💳', color: '#9E9E9E' };
};

export const getSimilarCategories = (categoryName: string): string[] => {
  const similarityMap: { [key: string]: string[] } = {
    'food': ['restaurant', 'dining', 'cafe', 'takeout', 'delivery', 'groceries'],
    'fuel': ['gas', 'petrol', 'diesel', 'station'],
    'entertainment': ['movie', 'cinema', 'games', 'streaming', 'music', 'concert'],
    'transportation': ['taxi', 'uber', 'bus', 'train', 'metro', 'parking'],
    'shopping': ['clothes', 'electronics', 'books', 'accessories', 'retail'],
    'bills': ['electricity', 'water', 'internet', 'phone', 'utility'],
    'healthcare': ['doctor', 'medicine', 'pharmacy', 'hospital', 'clinic'],
    'education': ['course', 'book', 'tuition', 'school', 'university'],
  };

  const lowerCategory = categoryName.toLowerCase();
  for (const [category, keywords] of Object.entries(similarityMap)) {
    if (keywords.some(keyword => lowerCategory.includes(keyword) || keyword.includes(lowerCategory))) {
      return keywords;
    }
  }
  return [];
};
