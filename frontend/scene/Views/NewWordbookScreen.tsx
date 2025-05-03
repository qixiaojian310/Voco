import {
  View,
  Text,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import React from 'react';
import {Input} from '@rneui/themed';
import {Button} from '@rneui/base';
import {add_words_to_wordbook} from '../../request/wordbook';
import {Modal} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
function NewWordbookScreen() {
  const [wordBookContent, setWordBookContent] = React.useState('');
  const [wordBookTitle, setWordBookTitle] = React.useState('');
  const [wordBookDescription, setWordBookDescription] = React.useState('');
  const [unAddWords, setUnAddWords] = React.useState<string[]>([]);
  const [addWords, setAddWords] = React.useState<string[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const navigation = useNavigation<any>();
  return (
    <View style={{flex: 1}}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Wordbook Import Summary</Text>
            <View style={styles.twoColumnContainer}>
              {/* ✅ Added Words */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>
                  ✅ Added ({addWords.length})
                </Text>
                <ScrollView style={styles.wordScroll}>
                  {addWords.map((word, index) => (
                    <Text key={`added-${index}`} style={styles.wordItem}>
                      {word}
                    </Text>
                  ))}
                </ScrollView>
              </View>

              {/* ❌ Not Found Words */}
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>
                  ❌ Not Found ({unAddWords.length})
                </Text>
                <ScrollView style={styles.wordScroll}>
                  {unAddWords.map((word, index) => (
                    <Text
                      key={`unadded-${index}`}
                      style={[styles.wordItem, {color: 'red'}]}>
                      {word}
                    </Text>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Button
              title="Close"
              onPress={() => {
                setShowModal(false);
                navigation.navigate('Book');
              }}
              containerStyle={{marginTop: 20}}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.toolbar} />
      <Text style={styles.title}>Add New Wordbook</Text>
      <View style={styles.controllerBar}>
        <Text style={styles.controllerBarTitle}>Book title</Text>
        <Input
          placeholder="Your title"
          onChangeText={text => setWordBookTitle(text)}
          value={wordBookTitle}
          placeholderTextColor={'#303030'}
          renderErrorMessage={false}
          style={{
            fontSize: 10,
            padding: 0,
            margin: 0,
          }}
        />
      </View>
      <View style={styles.controllerBar}>
        <Text style={styles.controllerBarTitle}>Book description</Text>
        <Input
          placeholder="Your description"
          onChangeText={text => setWordBookDescription(text)}
          placeholderTextColor={'#303030'}
          value={wordBookDescription}
          renderErrorMessage={false}
          style={{
            fontSize: 10,
          }}
        />
      </View>
      <View style={styles.wordbookContent}>
        <Text style={styles.controllerBarTitle}>Wordbook content</Text>
        <TextInput
          editable
          multiline
          numberOfLines={10000}
          onChangeText={text => setWordBookContent(text)}
          value={wordBookContent}
          style={styles.wordbookContentInput}
          placeholder="Input your wordbook content, you can use Enter to split words"
        />
      </View>
      <Button
        title="Save"
        onPress={async () => {
          const wordsArray = wordBookContent
            .split('\n') // 按换行符分割成数组
            .map(word => word.trim()) // 去除每行首尾空格
            .filter(Boolean); // 过滤掉空行

          const reqObj = {
            wordbook_name: wordBookTitle,
            wordbook_description: wordBookDescription,
            content: wordsArray,
          };
          if (
            wordBookTitle === '' ||
            wordBookDescription === '' ||
            wordBookContent.length === 0
          ) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Please fill in all fields',
              position: 'top',
              topOffset: 30,
            });
          } else {
            const res = await add_words_to_wordbook(reqObj);
            if (res) {
              setUnAddWords(res.not_found_words);
              setAddWords(res.final_add_words);
              setShowModal(true);
            }
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#c0c0c099',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    boxSizing: 'content-box',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 16,
    textAlign: 'center',
    backgroundColor: '#c0c0c099',
  },
  controllerBar: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  controllerBarTitle: {
    fontSize: 10,
    color: '#303030',
  },
  wordbookContent: {
    padding: 10,
    flex: 1,
  },
  wordbookContentInput: {
    padding: 10,
    flex: 1,
    backgroundColor: '#e8e3cc',
    textAlignVertical: 'top',
    borderRadius: 10,
    fontSize: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  wordScroll: {
    maxHeight: 200,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  wordItem: {
    fontSize: 12,
    paddingVertical: 2,
    textAlign: 'center',
  },
});
export default NewWordbookScreen;
