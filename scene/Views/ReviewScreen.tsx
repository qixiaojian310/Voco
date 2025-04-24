import {Badge, Divider} from '@rneui/themed';
import React, { useMemo } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RemStatus, Word} from '../../types/Word';
import WordContentCard from '../CoreComponents/WordContentCard';
import WordRemBadge from '../Review/WordRemBadge';
import WordRemButton from '../Review/WordRemButton';

function ReviewScreen() {
  const [showTrans, setShowTrans] = React.useState(false);
  const [word, setWord] = React.useState<Word>({
    rawWord: 'abandon',
    phonetic: '/əˈbændən/',
    translations: [
      {
        property: 'v.',
        meaning:
          '抛弃，遗弃；（因危险）离开，舍弃；中止，不再有；放弃（信念、信仰或看法）；陷入，沉湎于（某种情感）',
      },
      {
        property: 'n.',
        meaning: '放任，放纵',
      },
    ],
    sentences: [
      {
        sentence: 'I abandoned my job after I found a better one.',
        translation: '我在找到更好的工作后就放弃了我的工作。',
      },
      {
        sentence: 'She abandoned her job to start a new one.',
        translation: '她放弃了她的工作，开始了一个新的工作。',
      },
    ],
    helpers: [
      'abandon : 来自法语短语a bandon.a-词源同ad-,去，往，-band,说话，命令，词源同ban,phone.原指置于别人的命令之下，任人处置，后喻指遗弃。',
      'abandon:(a不+ban+don给予→不禁止给出去→放弃)',
    ],
    rem_records: [
      {
        time: 18,
        status: 'remember',
      },
      {
        time: 32,
        status: 'forgot',
      },
    ],
    rem_date: {
      remember: 65,
      vague: 3,
      forgot: 1,
    },
  });

  const rem_day_range = useMemo(() => {
    if (!word.rem_records || word.rem_records.length === 0) {return [];}

    const baseDate = new Date();
    const times = word.rem_records.map(r => r.time);

    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const startDate = new Date(baseDate.getTime() + minTime * 1000);
    const endDate = new Date(baseDate.getTime() + maxTime * 1000);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return [formatDate(startDate), formatDate(endDate)];

  },[word]);

  const showTransHandler = () => {
    setShowTrans(true);
  };

  const submitWordStatus = (status: RemStatus) => {
    console.log(status);
  };
  return (
    <View style={{flex: 1}}>
      <View style={styles.toolbar} />
      <View style={{height: 80, backgroundColor: '#66cadb8e'}}>
        <Text style={styles.mainWord}>{word.rawWord}</Text>
        <View style={styles.WordHintBox}>
          <Badge
            badgeStyle={{backgroundColor: '#c2c1c1'}}
            textStyle={{color: '#000000'}}
            status="success"
            value=" 英 "
          />
          <Text style={styles.WordHint}>{word.phonetic}</Text>
        </View>
      </View>
      {showTrans ? (
        <>
          <View style={styles.translation}>
            {word.translations.map(translation => {
              return (
                <View
                  style={{flexDirection: 'row', gap: 5}}
                  key={translation.meaning}>
                  <Badge value={` ${translation.property} `} />
                  <Text>{translation.meaning}</Text>
                </View>
              );
            })}
          </View>
          <ScrollView style={{flex: 1, backgroundColor: '#ffffffc3'}}>
            <WordContentCard title={'Example Sentences 例句'}>
              <>
                {word.sentences.map(sentence => {
                  return (
                    <View
                      style={{
                        gap: 5,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                      key={sentence.sentence}>
                      <Text style={{fontSize: 12, color: '#313131'}}>
                        {sentence.sentence}
                      </Text>
                      <Text style={{fontSize: 12, color: '#313131'}}>
                        {sentence.translation}
                      </Text>
                    </View>
                  );
                })}
              </>
            </WordContentCard>
            <WordContentCard title={'助记 Helper'}>
              <>
                {word.helpers.map(helper => {
                  return (
                    <View
                      style={{
                        gap: 5,
                        paddingTop: 10,
                        paddingBottom: 10,
                      }}
                      key={helper}>
                      <Text style={{fontSize: 12, color: '#313131'}}>
                        {helper}
                      </Text>
                    </View>
                  );
                })}
              </>
            </WordContentCard>
            <WordContentCard title={'记忆记录 Remember History'}>
              <Text style={{fontSize: 12, color: '#313131'}}>
                Record Range: {rem_day_range[0]} ➡️ {rem_day_range[1]}
              </Text>
              <View style={{flexWrap: 'wrap', gap: 2, flexDirection: 'row', paddingTop: 10, paddingBottom: 10}}>
                {word.rem_records.map(rem_record => {
                  return (
                    <WordRemBadge key={rem_record.time} status={rem_record.status} time={rem_record.time}/>
                  );
                })}
              </View>
            </WordContentCard>
          </ScrollView>
          <Divider width={4} color="#c4c4c4" />
          <View style={{flexDirection: 'row', backgroundColor: '#ffffffc3', padding: 20, gap: 20}}>
            {
              Object.keys(word.rem_date).map(key => {
                return (
                  <WordRemButton key={key} status={key as RemStatus} time={word.rem_date[key as RemStatus]} clickHandler={submitWordStatus}/>
                );
              })
            }
          </View>
        </>
      ) : (
        <TouchableOpacity onPress={showTransHandler} style={{flex: 1}}>
          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            <Text>请回忆单词发音和翻译</Text>
            <Text>
              Please recall the pronunciation and translation of words
            </Text>
            <Text style={{fontSize: 10, color: '#313131'}}>
              点击屏幕查看翻译
            </Text>
            <Text style={{fontSize: 10, color: '#313131'}}>
              Click the screen to view the translation
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#a2bfc3c5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
    height: 40,
  },
  mainWord: {
    fontSize: 30,
    fontWeight: 900,
    color: '#000000',
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
    color: '#313131',
  },
  translation: {
    padding: 10,
    gap: 5,
    backgroundColor: '#92cbd6c3',
  },
});

export default ReviewScreen;
