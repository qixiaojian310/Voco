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
  Switch,
} from 'react-native';
import React, {useCallback, useEffect} from 'react';
import {
  get_all_wordbook,
  get_all_wordbook_by_user,
  get_words_from_wordbook,
} from '../../request/wordbook';
import {Wordbook} from '../../types/Wordbook';
import {Icon, Input} from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import wordbookStore from '../../stores/WordbookStore';
import { useNavigation } from '@react-navigation/native';

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
    activeOpacity={0.8}
    onPress={() => {
      onPress(wordbook_id);
    }}>
    <View style={styles.item}>
      <Image
        style={{
          marginRight: 10,
          borderRadius: 5,
          width: 90,
          height: 120,
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
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = React.useState(false);
  const [allWordbook, setAllWordbook] = React.useState<Wordbook[]>([]);
  const [openFilter, setOpenFilter] = React.useState(false);
  const [wordbook_name, setWordbook_name] = React.useState('');
  const getWordbook = useCallback(
    async () => {
      if (openFilter) {
        const res = (await get_all_wordbook_by_user(
          wordbook_name,
        )) as Wordbook[];
        setAllWordbook(res);
      } else {
        const res = await get_all_wordbook(wordbook_name);
        setAllWordbook(res);
      }
    },
    [openFilter, wordbook_name],
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getWordbook();
    setRefreshing(false);
  }, [getWordbook]);
  useEffect(() => {
    getWordbook();
  }, [getWordbook]);

  const pressWordbookHandler = async (wordbook_id: number) => {
    // 点击跳转到单词本
    console.log(wordbook_id);
    const res = await get_words_from_wordbook(wordbook_id);
    wordbookStore.setUnlearnedWordList(res.unlearned_word_list);
    wordbookStore.setReviewWordList(res.review_word_list);
    await AsyncStorage.setItem('wordbook_id', wordbook_id.toString());
    navigation.navigate('Review');
  };
  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      <Text style={styles.title}>Wordbook list</Text>
      <View style={styles.controllerBar}>
        <View style={{flex: 1}}>
          <Input
            placeholder="Search"
            placeholderTextColor={'#cbcbcb'}
            leftIcon={
              <Icon
                name="search"
                type="font-awesome"
                size={24}
                color="#cbcbcb"
              />
            }
            onChangeText={text => {
              setWordbook_name(text);
            }}
            renderErrorMessage={false}
            inputStyle={{fontSize: 12, height: 50, color: '#ffffff'}}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Icon name="filter" type="font-awesome" size={24} color="#cbcbcb" />
          <Switch
            value={openFilter}
            onValueChange={value => setOpenFilter(value)}
          />
        </View>
      </View>
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
  controllerBar: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  item: {
    boxShadow: '0 0px 14px rgba(0, 0, 0, 0.692)',
    backgroundColor: '#ffffffa3',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    gap: 10,
    height: 120,
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
