
import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import './registerServiceWorker'
import './plugins/element.js'
import './plugins/treeView.js'
import './plugins/vueClipboard.js'
import './plugins/browserSolc.js'
import './plugins/analytics.js'
import './style.css'
Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')