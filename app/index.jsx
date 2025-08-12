import { configureStore, createSlice, nanoid } from "@reduxjs/toolkit";
import * as Device from "expo-device"; // Native module via Expo
import * as Haptics from "expo-haptics"; // Native module via Expo
import { use, useMemo, useState } from "react";
import { FlatList, Platform, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Appbar, Avatar, Banner, Button, Card, Divider, MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, Switch, Text, TextInput } from "react-native-paper";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

/********************
 * Managing State with Redux
 * 1) Introduction to Redux
 * 2) Actions, reducers, store
 * 3) Connecting components
 ********************/

// UI slice: theme + banners
const uiSlice = createSlice({
  name: "ui",
  initialState: { darkMode: false, showBanner: true },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    dismissBanner(state) {
      state.showBanner = false;
    },
  },
});

// Counter slice to demonstrate basic actions

  
// Todo slice to demonstrate lists and immutable updates
const todosSlice = createSlice({
  name: "todos",
  initialState: { items: [] },
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(title) {
        return { payload: { id: nanoid(), title, done: false, createdAt: Date.now() } };
      },
    },
    toggleTodo(state, action) {
      const t = state.items.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
    removeTodo(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    clearTodos(state) {
      state.items = [];
    },
  },
});

const { toggleDarkMode, showBanner, dismissBanner } = uiSlice.actions;

const { addTodo, toggleTodo, removeTodo, clearTodos } = todosSlice.actions;

const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    counter: counterSlice.reducer,
    todos: todosSlice.reducer,
  },
});

/********************
 * App Root
 ********************/

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemedApp />
    </ReduxProvider>
  );
}

function ThemedApp() {
  const darkMode = useSelector((s) => s.ui.darkMode);
  const theme = useMemo(() => {
    const basetheme = darkMode ? MD3DarkTheme : MD3LightTheme;

  return {
    ...basetheme,
    colors: {
      ...basetheme.colors,
      primary : "#09e96eff",
      onPrimary: "#ffffff",
    },
  };
}, [darkMode]);

/********************
 * User Interface Design
 * 1) Designing UIs for mobile
 * 2) Responsive/adaptive
 * 3) Best practices for mobile UI/UX (accessibility, touch targets, feedback)
 ********************/
return (
  <PaperProvider theme={theme}>
    <SafeAreaView style={{ flex: 1 }}>
      <AppScaffold />
    </SafeAreaView>
  </PaperProvider>
);

function AppScaffold() {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const showBanner = useSelector((s) => s.ui.showBanner);

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <Appbar.Header>
        <Appbar.Content title="Expo + Redux Demo" subtitle={`Running on ${Device.osName ?? "Unknown OS"}`} />
        <DarkModeSwitch />
      </Appbar.Header>

      {showBanner && (
        <Banner
          visible
          actions={[{ label: "Got it", onPress: () => dispatch(dismissBanner()) }]}
          icon={({ size }) => (
            <Avatar.Icon size={size} icon="information-outline" />
          )}
        >
          Task added (Haptics, Device).
        </Banner>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={[isTablet && styles.contentTablet, { paddingBottom: 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.column, isTablet && styles.columnTablet]}>
          <CounterCard />
          <LibraryCard />
        </View>
      </ScrollView>

      <Appbar style={styles.footer}>
        <Appbar.Action icon="github" accessibilityLabel="GitHub" onPress={() => {}} />
        <Appbar.Content title="Footer" subtitle={Platform.select({ ios: "iOS", android: "Android", default: "Web" })} />
      </Appbar>
    </View>
  );
}

function DarkModeSwitch() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s) => s.ui.darkMode);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingRight: 12 }}>
      <Text accessibilityRole="header" style={{ marginRight: 8 }}>{darkMode ? "Dark" : "Light"}</Text>
      <Switch
        value={darkMode}
        onValueChange={() => dispatch(toggleDarkMode())}
        accessibilityLabel="Toggle dark mode"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </View>
  );
}

/********************
 * Working with External Libraries
 * 1) Using third-party libs (React Native Paper for UI)
 * 2) Popular libs showcase (Paper components)
 * 3) Integrating native modules (expo-haptics, expo-device)
 ********************/


function TodosCard() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.todos.items);
  const [title, setTitle] = useState("");
  const { width } = useWindowDimensions();
  const numColumns = width >= 900 ? 2 : 1; // responsive list
const addTask = () => {
  if (!title.trim()) return;
  dispatch(addTodo(title.trim()));
  setTitle("");
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
  return (
    <Card style={styles.card}>
      <Card.Title title="Todos (Redux list)" subtitle="Responsive FlatList" left={(props) => <Avatar.Icon {...props} icon="check-circle-outline" />} />
      <Card.Content>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            style={{ flex: 1 }}
            label="What needs doing?"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={() => {
              if (!title.trim()) return;
              dispatch(addTodo(title.trim()));
              setTitle("");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            returnKeyType="done"
          />
          <Button mode="contained" onPress={addTask}
          >Add</Button>
        </View>
        <Divider style={{ marginVertical: 12 }} />

        <FlatList
          data={items}
          key={numColumns}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Card style={{ flex: 1, marginRight: numColumns > 1 ? 8 : 0 }}>
              <Card.Title
                title={item.title}
                subtitle={new Date(item.createdAt).toLocaleString()}
                left={(props) => <Avatar.Icon {...props} icon={item.done ? "check" : "circle-outline"} />}
              />
              <Card.Actions>
                <Button onPress={() => dispatch(toggleTodo(item.id))}textColor="#09e96eff">DONE</Button>
                <Button onPress={() => dispatch(removeTodo(item.id))} textColor="#d11">Remove</Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={<Text accessibilityLabel="Empty list">No todos yet. Add one above.</Text>}

        />
        {items.length > 0 && (
          <Button style={{ marginTop: 8 }} onPress={() => dispatch(clearTodos())}>Clear All</Button>
        )}
      </Card.Content>
    </Card>
  );
}

function LibraryCard() {
  return (
    <Card style={styles.card}>
      <Card.Title title="Third‑party UI library" subtitle="React Native Paper components" left={(props) => <Avatar.Icon {...props} icon="palette" />} />
      <Card.Content>
        <Text>
          This app uses <Text style={{ fontWeight: "bold" }}>react-native-paper</Text> for theming, typography, and accessible UI primitives.
          Try toggling dark mode above and notice automatic color adaptation.
        </Text>
        <View style={{ height: 12 }} />
        <Text>Other popular libraries you can explore:</Text>
        <View style={{ height: 6 }} />
        <Text>• React Navigation — screens & stacks</Text>
        <Text>• React Native Elements — alternative UI kit</Text>
        <Text>• Reanimated/Gesture Handler — high‑performance gestures</Text>
      </Card.Content>
    </Card>
  );
}

function Donecard() {
  const dispatch  = useDispatch();
    const items = useSelector((s)=> s.todos.items.filter((item) => item.done));
      const {width} = useWindowDimensions() 
        const numColumns = width >= 850? 2:1;
return(
  <Card style ={styles.card}>
    <Card.Title title="Done (Completed tasks)" left={(props) => <Avatar.Icon {...props} icon="check-circle" />} />

    <Card.Content>
      <FlatList
        data={items}
        key={numColumns}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <Card style={{ flex: 1, marginRight: numColumns > 1 ? 8 : 0 }}>
            <Card.Title
              title={item.title}
              subtitle={new Date(item.createdAt).toLocaleString()}
              left={(props) => <Avatar.Icon {...props} icon="check"/>}
            />
            <Card.Actions>
              <Button onPress={() => dispatch(toggleTodo(item.id))}>Undo</Button>
              <Button onPress={() => dispatch(removeTodo(item.id))} textColor="#ec2626ff">Remove</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text accessibilityLabel="Empty list">No todos yet. Add one above.</Text>}
      />
    </Card.Content>
  </Card>
);

}


/********************
 * Styles — mobile‑first, adapt on tablets
 ********************/

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  containerTablet: { paddingHorizontal: 12 },
  content: { flex: 1, padding: 12 },
  contentTablet: { flexDirection: "row", gap: 12 },
  column: { flex: 1 },
  columnTablet: { flex: 1 },
  card: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  footer: { justifyContent: "center" },
});
