import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback} from 'react';
import {WordItem} from '../../../types/Word';
import {observer} from 'mobx-react';
import wordbookStore from '../../../stores/WordbookStore';
import {get_words_detail_from_wordbook} from '../../../request/word';
import {useFocusEffect} from '@react-navigation/native';
import {Badge, Icon, Input} from '@rneui/themed';
import WordRemBadge from '../../Review/WordRemBadge';

function WordItemComponent({
  word,
  translations,
  study_records,
  user_word,
}: WordItem) {
  return (
    <View style={styles.item}>
      <View style={{flex: 1}}>
        <Text>{word}</Text>
        {translations.map(translation => (
          <View key={translation.translation_id} style={styles.translation}>
            <Badge
              value={` ${translation.abbreviation} `}
              textStyle={{fontSize: 7}}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{flex: 1, fontSize: 10}}>
              {translation.translation}
            </Text>
          </View>
        ))}
        {study_records.length > 0 && (
          <View style={styles.study_records}>
            <ScrollView horizontal={true}>
              {study_records.map(study_record => (
                <WordRemBadge
                  key={study_record.record_time}
                  memory_status={study_record.memory_status}
                  record_time={study_record.record_time}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      <View style={styles.user_word}>
        <Text style={{fontSize: 10}}>Easiness:</Text>
        <Text style={{fontSize: 10}}>
          {user_word?.easiness ? user_word.easiness : 2.5}
        </Text>
        <Text style={{fontSize: 10}}>Review interval:</Text>
        <Text style={{fontSize: 10}}>
          {user_word?.review_interval ? user_word.review_interval : 0}
        </Text>
      </View>
    </View>
  );
}

const MemoryList = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [allWord, setAllWord] = React.useState<WordItem[]>([]);
  const [search_word, setSearch_word] = React.useState('');
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    //TODO REQ
    const res = await get_words_detail_from_wordbook(wordbookStore.wordbook_id,search_word);
    console.log(res);
    setAllWord(res);
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wordbookStore.wordbook_id,
    wordbookStore.review_word_list,
    wordbookStore.unlearned_word_list,
    search_word,
  ]);
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );
  return (
    <View style={{flex: 1}}>
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
              setSearch_word(text);
            }}
            renderErrorMessage={false}
            inputStyle={{fontSize: 12, height: 50, color: '#ffffff'}}
          />
        </View>
      </View>
      <FlatList
        data={allWord}
        keyExtractor={item => item.word.toString()}
        maxToRenderPerBatch={5}
        renderItem={({item}) => (
          <WordItemComponent
            word={item.word}
            translations={item.translations}
            study_records={item.study_records}
            user_word={item.user_word}
          />
        )}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#e3e3e3cf',
  },
  item: {
    boxShadow: '0 0px 14px rgba(0, 0, 0, 0.692)',
    backgroundColor: '#ffffffa3',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 10,
    gap: 10,
    flexDirection: 'row',
  },
  translation: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  study_records: {
    marginTop: 10,
  },
  user_word: {
    width: 50,
  },
  controllerBar:{
    paddingHorizontal: 16,
    height: 50,
  },
});

export default MemoryList;
