import { AppRegistry } from 'react-native';
import App from './src/App';
import './src/App.css';
import { name as appName } from './app.json';

// 在web环境下渲染应用
AppRegistry.registerComponent(appName, () => App);

// web特有启动逻辑
if (module.hot) {
  module.hot.accept();
}

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
