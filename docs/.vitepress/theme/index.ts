import DefaultTheme from 'vitepress/theme'
import Layout from './components/Layout.vue'
import PagefindSearch from './components/PagefindSearch.vue'
import CommitHistory from './components/CommitHistory.vue'
import VPFooter from './components/VPFooter.vue'
import UpdateTime from './components/UpdateTime.vue'
import ResourceTabs from './components/ResourceTabs.vue'
import SupportSection from '../components/SupportSection.vue'
import GitHubLink from '../components/GitHubLink.vue'
import './style.css'

export default {
  ...DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component('PagefindSearch', PagefindSearch)
    app.component('CommitHistory', CommitHistory)
    app.component('UpdateTime', UpdateTime)
    app.component('ResourceTabs', ResourceTabs)
    app.component('SupportSection', SupportSection)
    app.component('GitHubLink', GitHubLink)
    app.component('VPFooter', VPFooter)
  }
}
