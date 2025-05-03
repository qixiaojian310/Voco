import {Badge, Divider, Icon, Skeleton} from '@rneui/themed';
import React, {useCallback, useEffect, useMemo} from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RemDate, RemStatus, Word} from '../../types/Word';
import WordContentCard from '../CoreComponents/WordContentCard';
import WordRemBadge from '../Review/WordRemBadge';
import WordRemButton from '../Review/WordRemButton';
import {observer} from 'mobx-react';
import wordbookStore from '../../stores/WordbookStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {computeSM2, firstReview} from '../../utils/sm2';
import {get_word_info, set_word_status} from '../../request/word';
import {useFocusEffect} from '@react-navigation/native';
import userStore from '../../stores/UserStore';

const ReviewScreen = observer(() => {
  const [showTrans, setShowTrans] = React.useState(false);
  const [allTodayWords, setAllTodayWords] = React.useState<string[]>([]);
  const [reqWord, setReqWord] = React.useState<Word>({
    word: 'abandon',
    phonetic: '/əˈbændən/',
    translations: [
      {
        abbreviation: 'v.',
        translation:
          '抛弃，遗弃；（因危险）离开，舍弃；中止，不再有；放弃（信念、信仰或看法）；陷入，沉湎于（某种情感）',
      },
      {
        abbreviation: 'n.',
        translation: '放任，放纵',
      },
    ],
    example_sentence: [
      {
        sentence: 'I abandoned my job after I found a better one.',
        translation: '我在找到更好的工作后就放弃了我的工作。',
      },
      {
        sentence: 'She abandoned her job to start a new one.',
        translation: '她放弃了她的工作，开始了一个新的工作。',
      },
    ],
    etymology:
      'abandon : 来自法语短语a bandon.a-词源同ad-,去，往，-band,说话，命令，词源同ban,phone.原指置于别人的命令之下，任人处置，后喻指遗弃。',
    study_records: [],
    user_word: null,
  });
  const [allTodayWordsIndex, setAllTodayWordsIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const rem_date = useMemo<RemDate>(() => {
    if (!reqWord.user_word) {
      return {
        remembered: firstReview('remembered', new Date()),
        forgot: firstReview('forgot', new Date()),
        vague: firstReview('vague', new Date()),
      };
    } else {
      return {
        remembered: computeSM2({
          qualityText: 'remembered',
          easiness: reqWord.user_word.easiness,
          interval: reqWord.user_word.review_interval,
          review_count: reqWord.user_word.review_count,
          review_datetime: reqWord.user_word.current_review,
        }),
        forgot: computeSM2({
          qualityText: 'forgot',
          easiness: reqWord.user_word.easiness,
          interval: reqWord.user_word.review_interval,
          review_count: reqWord.user_word.review_count,
          review_datetime: reqWord.user_word.current_review,
        }),
        vague: computeSM2({
          qualityText: 'vague',
          easiness: reqWord.user_word.easiness,
          interval: reqWord.user_word.review_interval,
          review_count: reqWord.user_word.review_count,
          review_datetime: reqWord.user_word.current_review,
        }),
      };
    }
  }, [reqWord]);

  const rem_day_range = useMemo(() => {
    if (!reqWord.study_records || reqWord.study_records.length === 0) {
      return [];
    }

    const times = reqWord.study_records.map(r =>
      new Date(r.record_time).getTime(),
    );

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const startDate = new Date(minTime);
    const endDate = new Date(maxTime);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return [formatDate(startDate), formatDate(endDate)];
  }, [reqWord]);

  const WordsChoose = useCallback(async () => {
    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastGeneratedDate = await AsyncStorage.getItem(
      'today_word_generated_date',
    );

    if (lastGeneratedDate !== todayStr) {
      await AsyncStorage.removeItem(
        `today_all_words_${wordbookStore.wordbook_id}`,
      );
      await AsyncStorage.setItem('today_word_generated_date', todayStr);
    }

    const res = await AsyncStorage.getItem(
      `today_all_words_${wordbookStore.wordbook_id}`,
    );
    setIsLoading(true);
    if (res) {
      setAllTodayWords(JSON.parse(res));
    } else {
      const userInfoJSON = await AsyncStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoJSON!);
      const dailyGoal = userInfo.daily_goal;

      // Step 1: 筛选需要复习的词（根据复习间隔）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const review_word_list = wordbookStore.review_word_list
        .filter((wordItem: any) => {
          const lastReviewDate = new Date(wordItem.word_metric.current_review);
          const nextReviewDate = new Date(lastReviewDate);
          nextReviewDate.setDate(
            lastReviewDate.getDate() + wordItem.word_metric.review_interval,
          );
          return today.getDay() >= nextReviewDate.getDay();
        })
        .map((wordItem: any) => wordItem.word);
      console.log('review_word_list', review_word_list);

      // Step 2: 打乱数组的函数
      const shuffle = (array: any[]) => {
        return array.sort(() => Math.random() - 0.5);
      };

      const shuffled_review = shuffle(review_word_list);
      const shuffled_new = shuffle(wordbookStore.unlearned_word_list);

      // Step 3: 按比例选择复习词和新词
      const targetReviewCount = Math.min(
        Math.floor((3 / 5) * dailyGoal),
        shuffled_review.length,
      );
      const targetNewCount = dailyGoal - targetReviewCount;

      const selectedReview = shuffled_review.slice(0, targetReviewCount);

      const selectedNew = shuffled_new.slice(0, targetNewCount);

      const todayAllWords = [...selectedReview, ...selectedNew];

      await AsyncStorage.setItem(
        `today_all_words_${wordbookStore.wordbook_id}`,
        JSON.stringify(todayAllWords),
      );
      setAllTodayWords(todayAllWords);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    wordbookStore.review_word_list,
    wordbookStore.unlearned_word_list,
    wordbookStore.wordbook_id,
  ]);

  const showTransHandler = () => {
    setShowTrans(true);
  };

  useFocusEffect(
    useCallback(() => {
      setShowTrans(false);

      const initIndex = async () => {
        const saved = await AsyncStorage.getItem(
          `all_today_words_index_${wordbookStore.wordbook_id}`,
        );
        if (saved !== null) {
          setAllTodayWordsIndex(parseInt(saved, 10));
        } else {
          setAllTodayWordsIndex(0);
        }
      };

      initIndex();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wordbookStore.wordbook_id]),
  );

  const clickBackHandler = () => {
    userStore.unSelectBook();
  };

  useEffect(() => {
    const changeWordIndex = async () => {
      await AsyncStorage.setItem(
        `all_today_words_index_${wordbookStore.wordbook_id}`,
        allTodayWordsIndex.toString(),
      );
    };
    changeWordIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTodayWordsIndex, wordbookStore.wordbook_id]);

  const submitWordStatus = useCallback(
    async (status: RemStatus) => {
      setIsLoading(true);
      const rem_req = rem_date[status];
      const request = {
        word: reqWord.word,
        memory_status: status,
        is_review: true,
        current_review: new Date().toISOString().replace('T', ' ').slice(0, 19),
        easiness: rem_req.easiness,
        review_interval: rem_req.interval,
        next_review: rem_req.review_datetime,
      };
      console.log('req', request);
      const res = await set_word_status(request);
      console.log('res', res);
      if (res) {
        // 切换下一个词
        let statusCount = await AsyncStorage.getItem(`${status}_count`);
        statusCount = (
          statusCount ? parseInt(statusCount, 10) + 1 : 1
        ).toString();
        await AsyncStorage.setItem(`${status}_count`, statusCount);
        setAllTodayWordsIndex(prev => prev + 1);
        setShowTrans(false);
      }
      setIsLoading(false);
    },
    [rem_date, reqWord],
  );

  useEffect(() => {
    //选择单词
    const initWord = async () => {
      setIsLoading(true);
      if (allTodayWords.length === 0) {
        return;
      }
      AsyncStorage.setItem(
        'all_today_words_index',
        allTodayWordsIndex.toString(),
      );
      const res = await get_word_info(allTodayWords[allTodayWordsIndex]);
      setReqWord(res);
      setIsLoading(false);
    };
    initWord();
  }, [allTodayWords, allTodayWordsIndex]);

  useEffect(() => {
    WordsChoose();
  }, [WordsChoose]);
  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      {!isLoading ? (
        <>
          <View style={{height: 100, backgroundColor: '#8684ec6d'}}>
            <TouchableOpacity onPress={clickBackHandler}>
              <View style={styles.cleanBar}>
                <Icon name="trash" type="font-awesome" color="#c2c1c1" />
                <Text style={{color: '#c2c1c1'}}>Choose a new book</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.mainWord}>{reqWord.word}</Text>
            <View style={styles.WordHintBox}>
              <Badge
                badgeStyle={{backgroundColor: '#c2c1c1'}}
                textStyle={{color: '#000000'}}
                status="success"
                value=" 英 "
              />
              <Text style={styles.WordHint}>{reqWord.phonetic}</Text>
            </View>
          </View>
          {showTrans ? (
            <>
              <View style={styles.translation}>
                {reqWord.translations.map(translation => {
                  return (
                    <View
                      style={{flexDirection: 'row', gap: 5}}
                      key={translation.translation}>
                      <Badge value={` ${translation.abbreviation} `} />
                      <Text style={{color: '#ffffff'}}>
                        {translation.translation}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <ScrollView style={{flex: 1, backgroundColor: '#00000027'}}>
                <WordContentCard title={'Example Sentences 例句'}>
                  <>
                    {reqWord.example_sentence ? (
                      reqWord.example_sentence.map(sentence => {
                        return (
                          <View
                            style={{
                              gap: 5,
                              paddingTop: 10,
                              paddingBottom: 10,
                            }}
                            key={sentence.sentence}>
                            <Text style={{fontSize: 12, color: '#cbcbcb'}}>
                              {sentence.sentence}
                            </Text>
                            <Text style={{fontSize: 12, color: '#cbcbcb'}}>
                              {sentence.translation}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <Text>暂无例句</Text>
                    )}
                  </>
                </WordContentCard>
                <WordContentCard title={'助记 Helper'}>
                  <View
                    style={{
                      gap: 5,
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}>
                    <Text style={{fontSize: 12, color: '#cbcbcb'}}>
                      {reqWord.etymology}
                    </Text>
                  </View>
                </WordContentCard>
                <WordContentCard title={'记忆记录 Remember History'}>
                  <Text style={{fontSize: 12, color: '#cbcbcb'}}>
                    Record Range: {rem_day_range[0]} ➡️ {rem_day_range[1]}
                  </Text>
                  <View
                    style={{
                      flexWrap: 'wrap',
                      gap: 2,
                      flexDirection: 'row',
                      paddingTop: 10,
                      paddingBottom: 10,
                    }}>
                    {reqWord.study_records.length ? (
                      reqWord.study_records.map(study_record => {
                        return (
                          <WordRemBadge
                            key={study_record.record_time}
                            memory_status={study_record.memory_status}
                            record_time={study_record.record_time}
                          />
                        );
                      })
                    ) : (
                      <Text>暂无记录</Text>
                    )}
                  </View>
                </WordContentCard>
              </ScrollView>
              <Divider width={4} color="#383838" />
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#00000045',
                  padding: 20,
                  gap: 20,
                }}>
                {Object.keys(rem_date).map(key => {
                  return (
                    <WordRemButton
                      key={key}
                      memory_status={key as RemStatus}
                      record_time={rem_date[
                        key as RemStatus
                      ].interval.toString()}
                      clickHandler={submitWordStatus}
                    />
                  );
                })}
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={showTransHandler} style={{flex: 1}}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                <Text style={styles.transLabel}>请回忆单词发音和翻译</Text>
                <Text style={styles.transLabel}>
                  Please recall the pronunciation and translation of words
                </Text>
                <Text style={{fontSize: 10, color: '#e0d5d5'}}>
                  点击屏幕查看翻译
                </Text>
                <Text style={{fontSize: 10, color: '#e0d5d5'}}>
                  Click the screen to view the translation
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={{gap: 5}}>
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
          <Skeleton animation="pulse" style={{opacity: 0.1}} height={30} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#8684ec6d',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
  cleanBar:{
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  transLabel: {
    fontSize: 12,
    color: '#e0d5d5',
  },
  mainWord: {
    fontSize: 30,
    fontWeight: 900,
    color: '#bbbbbb',
    textAlign: 'center',
    fontFamily: 'arial',
  },
  WordHintBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  WordHint: {
    fontSize: 10,
    fontWeight: 900,
    color: '#bbbbbb',
  },
  translation: {
    padding: 10,
    gap: 5,
    backgroundColor: '#54539cab',
  },
});

export default ReviewScreen;
