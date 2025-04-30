import {
  View,
  Text,
  Platform,
  StatusBar,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect} from 'react';
import {get_all_wordbook} from '../../request/wordbook';
import {Wordbook} from '../../types/Wordbook';

const WordbookItem = ({
  title,
  description,
  wordbook_id,
  onPress,
}: {
  title: string;
  description: string;
  wordbook_id: number;
  onPress: (wordbook_id: number) => void;
}) => (
  <TouchableOpacity
    onPress={() => {
      onPress(wordbook_id);
    }}>
    <View style={styles.item}>
        <Image
          style={{
            marginRight: 10,
            borderRadius: 5,
            width: 60,
            height: 80,
          }}
          resizeMode="cover"
          source={require('../../assets/wordbook_cover.png')}
        />
      <View style={{flex: 1}}>
        <Text style={styles.wordbook_title}>{title}</Text>
        <View style={{flex: 1}}>
          <Text style={styles.wordbook_subtitle}>{description}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
function WordbookScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [allWordbook, setAllWordbook] = React.useState<Wordbook[]>([]);
  const onRefresh = async () => {
    setRefreshing(true);
    const res = await get_all_wordbook();
    setAllWordbook(res);
    setRefreshing(false);
  };
  useEffect(() => {
    const getAllWordbook = async () => {
      const res = await get_all_wordbook();
      setAllWordbook(res);
    };
    getAllWordbook();
  },[]);

  const pressWordbookHandler = (wordbook_id: number) => {
    console.log(wordbook_id);
  };
  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      <Text style={styles.title}>Wordbook list</Text>
      <FlatList
        data={allWordbook}
        keyExtractor={item => item.wordbook_id.toString()}
        maxToRenderPerBatch={20}
        renderItem={({item}) => (
          <WordbookItem
            title={item.name}
            description={item.description}
            wordbook_id={item.wordbook_id}
            onPress={pressWordbookHandler}
          />
        )}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#8684ec6d',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 16,
    textAlign: 'center',
    backgroundColor: '#8684ec6d',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#8684ec31',
  },
  item: {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#c3b7cfa4',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },
  wordbook_title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordbook_subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
export default WordbookScreen;
