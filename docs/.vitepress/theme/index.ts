import Layout from './components/Layout.vue'
import ResourceDetail from './components/ResourceDetail.vue'
import './style.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ResourceDetail', ResourceDetail)
  }
}
