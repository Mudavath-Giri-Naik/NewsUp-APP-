import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Dimensions } from 'react-native';

type Props = {
  selected: string;
  onSelect: (paper: string) => void;
};
//this is where actual things will start it will checks key = collection name in DailyNews Database
const papers = [
  { key: 'The Hindu', logo: require('../assets/logos/th.png') },
  { key: 'Times of India', logo: require('../assets/logos/toi.png') },
  { key: 'Exam', logo: require('../assets/logos/pib.jpg') },
  { key: 'Hindustan Times', logo: require('../assets/logos/ht.jpg') },
  { key: 'Indian Express', logo: require('../assets/logos/ie.jpg') },
];

const BottomNavbar: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.wrapper}>
      {/* White background behind the navbar */}
      <View style={styles.background} />

      {/* Actual Navbar on top */}
      <View style={styles.container}>
        {papers.map((paper) => (
          <TouchableOpacity
            key={paper.key}
            onPress={() => onSelect(paper.key)}
            style={styles.iconWrapper}
          >
            <View
              style={[
                styles.iconContainer,
                selected === paper.key && styles.selectedIcon,
              ]}
            >
              <Image
                source={paper.logo}
                style={styles.icon}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BottomNavbar;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 100,
    backgroundColor: 'white',
    zIndex: 0,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 380,
    height: 85,
    padding: 10,
    marginBottom: 8,
    borderColor: '#050505',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 1,
  },
  iconWrapper: {
    marginHorizontal: 5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 40,
    padding: 0,
    width: 60,
    height: 60,
  },
  selectedIcon: {
    borderColor: 'black',
    borderWidth: 3,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});
