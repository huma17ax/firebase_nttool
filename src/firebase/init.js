import firebase from 'firebase/app'
import 'firebase/analytics'
import 'firebase/database'
import 'firebase/auth'
import config from './config'

if (!firebase.apps.length) {
    firebase.initializeApp(config)
    firebase.analytics()
}

export default firebase