// src/utils/greetingHelpers.js
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Maayung Bungkag';
  } else if (hour >= 12 && hour < 18) {
    return 'Maayung Afternoon';
  } else {
    return 'Maayung Ebning';
  }
};

export const getFormattedDate = () => {
  const now = new Date();
  
  // Get day name
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[now.getDay()];
  
  // Get date with ordinal suffix
  const date = now.getDate();
  const suffix = getOrdinalSuffix(date);
  
  // Get month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[now.getMonth()];
  
  return `${dayName}, ${date}${suffix} ${monthName}`;
};

const getOrdinalSuffix = (number) => {
  if (number > 3 && number < 21) return 'th';
  switch (number % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const getMotivationalMessage = () => {
  const messages = [
    "It's a nice day to be productive #KeepHustling!",
    "One Tap away #TapWay!",
    "Bangun Bogo #WeLoveBogo!",
    "Every emergency handled makes a difference",
    "Stay alert, stay safe, save lives",
    "Your work matters to the community",
    "Ready to respond, ready to serve",
    "Making our community safer, one response at a time"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};