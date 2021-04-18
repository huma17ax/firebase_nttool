// import io from 'socket.io-client'
import JsSHA from 'jssha'
import router from '@/router/index.js'
import firebase from '@/firebase/init'

function genHash (origin) {
  const shaObj = new JsSHA('SHA-256', 'TEXT')
  let seed = origin
  if (!seed) {
    let date = (new Date()).valueOf.toString()
    let random = Math.random().toString()
    seed = date+random
  }
  shaObj.update(seed)
  return shaObj.getHash('HEX')
}

function genPW () {
  let items = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
  let N = 10
  return Array.from(Array(N)).map(()=>items[Math.floor(Math.random()*items.length)]).join('')
}

const state = {
  // --- user ---
  connectStatus: false,
  loginFailed: false,
  groupName: '',
  password: '',
  userName: '',
  roomName: '',
  authID: '',
  roommates: [],
  // --- input ---
  texts: [['\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', 'default']],
  chatTexts: [],
  newChat: false,
  newGlobalChat: false,
  undoneText: '',
  focusTyping: false,
  fkey: [
    '先生／',
    '学生／',
    '／',
    '(スライド)',
    '',
    '',
    ''
  ],
  // --- timer ---
  scheduleState: false,
  scheduleTime: 0,
  scheduleID: undefined,
  // --- echo ---
  echoTime: -1,
  echoQueue: [],
  startTime: 0,
  // --- setting ---
  methodType: '1',
  // --- manage ---
  subWindowID: undefined,
  manageData: [],
  // --- animation ---
  pageTransition: undefined
}

const getters = {
  texts (state) {
    let ret = state.texts.map((item) => { return item[0] }).join('').split('\n')
    ret[ret.length - 1] += '■'
    return ret
  },
  roomMembers (state) {
    return state.roommates.sort((a, b) => a.id - b.id)
  },
  scheduleTime (state) {
    return Math.floor(state.scheduleTime / 60) + '分' + (state.scheduleTime % 60) + '秒'
  }
}

const actions = {
  synchronizeText ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/members/'+state.authID).update({'input': payload})
  },
  sendText ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').push({'message': payload, 'timestamp': firebase.database.ServerValue.TIMESTAMP})
  },
  undoText ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').limitToLast(1).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0]
        firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').child(key).remove()
        commit('setUndoneText', snapshot.val()[key].message)
      }
    })
  },
  delete1 ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').limitToLast(1).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0]
        const message = snapshot.val()[key].message
        if (message.length==1) {
          firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').child(key).remove()
        } else {
          firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').child(key).update({
            message: message.substring(0, message.length-1),
            timestamp: firebase.database.ServerValue.TIMESTAMP
          })
        }
      }
    })
  },
  sendRoomChat ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/chat').push({'message': payload, 'timestamp': firebase.database.ServerValue.TIMESTAMP, 'sender': state.authID})
  },
  sendGlobalChat ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/global_chat').push({'message': payload, 'timestamp': firebase.database.ServerValue.TIMESTAMP, 'sender': state.authID})
  },
  async makeGroup ({commit, state, dispatch}, payload) {
    commit('setLoginFailed', '')
    if (!state.connectStatus) return
    //パスワードのブラウザ保存
    //セットユーザーID
    const PW = genPW()
    const GROUP = 'groups/' + payload.groupName + '_' + genHash(PW)
    const p1 = firebase.database().ref('authentications/'+state.authID).set({[payload.groupName + '_' + genHash(PW)]: true})
    const p2 = firebase.database().ref(GROUP).update({'name': payload.groupName})
    Promise.all([p1, p2])
    .then(() => {
      dispatch('joinGroup', {groupName: payload.groupName, password: PW})
    })
    .catch((error) => {
      commit('setLoginFailed', 'グループを作成できませんでした')
    })
  },
  async joinGroup ({commit, state, dispatch}, payload) {
    commit('setLoginFailed', '')
    if (!state.connectStatus) return
    const GROUP = 'groups/' + payload.groupName + '_' + genHash(payload.password)
    firebase.database().ref('authentications/'+state.authID).set({[payload.groupName + '_' + genHash(payload.password)]: true})
    firebase.database().ref(GROUP+'/members/'+state.authID).update({'name': 'default'})
    const tryGroup = await firebase.database().ref(GROUP).once('value')
    if (!tryGroup.exists()) {
      commit('setLoginFailed', 'グループ名/パスワードが違います')
      return
    }
    commit('setGroupName', payload.groupName)
    commit('setPassword', payload.password)
    commit('setUserName', 'default')
    const gChatHist = await firebase.database().ref(GROUP+'/global_chat').once('value')
    if (gChatHist.exists()) {
      commit('setNewGlobalChat', false)
    } else {
      commit('setNewGlobalChat', true)
    }
    firebase.database().ref(GROUP+'/global_chat').limitToLast(1).on('child_added', (snapshot) => {
      if (state.newGlobalChat) {
        commit('addChatText', snapshot.val().message)
      } else {
        commit('setNewGlobalChat', true)
      }
    })
    dispatch('joinRoom', {room: 'default'}).then(() => {
      router.push('/chat')
    })
  },
  async leaveGroup ({commit, state, dispatch}, payload) {
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    await dispatch('leaveRoom')
    firebase.database().ref(GROUP+'/members/'+state.authID).set(null)
    firebase.database().ref(GROUP+'/global_chat').limitToLast(1).off()
    firebase.database().ref(GROUP+'/members').off()
    firebase.database().ref('authentications/'+state.authID).set(null)
    commit('initializeStatus')
    router.push('/').catch(err => { console.log(err) })
  },
  async setUserName ({commit, state}, payload) {
    if (state.userName == payload) return
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    const user_updates = {
      ['/rooms/'+state.roomName+'/members/'+state.authID+'/name']: payload,
      ['/members/'+state.authID+'/name']: payload
    }
    await firebase.database().ref(GROUP).update(user_updates)
    commit('setUserName', payload)
  },
  async changeRoom ({commit, state, dispatch}, payload) {
    if (state.roomName == payload.room) return
    if (!state.groupName || !state.connectStatus) return
    const userData = await dispatch('leaveRoom')
    await dispatch('joinRoom', {room: payload.room, data: userData})
  },
  async joinRoom ({commit, state}, payload) {
    if (state.roomName == payload.room) return
    if (!state.groupName || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    let userData = (payload.data ? payload.data : {'name': state.userName, 'input': ''})
    const error = await firebase.database().ref(GROUP+'/rooms/'+payload.room+'/members/'+state.authID).update(userData)
    if (error) return

    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/text').on('child_added', (snapshot) => {
      commit('addText', {text: snapshot.val().message, id:snapshot.key})
    })
    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/text').on('child_changed', (snapshot) => {
      commit('updateText', {text: snapshot.val().message, id:snapshot.key})
    })
    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/text').on('child_removed', (snapshot) => {
      commit('removeText', {text: snapshot.val().message, id:snapshot.key})
    })

    const rChatHist = await firebase.database().ref(GROUP+'/rooms/'+payload.room+'/chat').once('value')
    if (rChatHist.exists()) {
      commit('setNewChat', false)
    } else {
      commit('setNewChat', true)
    }
    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/chat').limitToLast(1).on('child_added', (snapshot) => {
      if (state.newChat) {
        commit('addChatText', snapshot.val().message)
      } else {
        commit('setNewChat', true)
      }
    })

    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/members').on('child_added', (snapshot) => {
      commit('addRoommate', {id: snapshot.key, name: snapshot.val().name, input: snapshot.val().input})
    })
    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/members').on('child_changed', (snapshot) => {
      commit('updateRoommate', {id: snapshot.key, name: snapshot.val().name, input: snapshot.val().input})
    })
    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/members').on('child_removed', (snapshot) => {
      commit('removeRoommate', {id: snapshot.key})
    })

    firebase.database().ref(GROUP+'/rooms/'+payload.room+'/schedule').on('value', (snapshot) => {
      if (!snapshot.exists()) return
      const schedule = snapshot.val()
      if (schedule.start == 0) {
        commit('setSchedule', {type: 'stop'})
      } else {
        firebase.database().ref('.info/serverTimeOffset').once('value')
        .then((offsetSS) => {
          const offset = offsetSS.val()
          const past = (new Date().getTime() + offset - schedule.start) % (schedule.time * 1000)
          commit('setSchedule', {type: 'start', now: schedule.time - Math.round(past / 1000), seconds: schedule.time})
        })
      }
    })
    commit('setRoomName', payload.room)
    firebase.database().ref(GROUP+'/members/'+state.authID+'/rooms/'+payload.room).set(true)
  },
  async leaveRoom ({commit, state}, payload) {
    if (!state.groupName || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/text').off()
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/chat').limitToLast(1).off()
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/members').off()
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/schedule').off()
    commit('initText')
    commit('initChatText')
    commit('initRoommate')
    commit('setSchedule', {type: 'stop'})
    const snapshot = await firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/members/'+state.authID).once('value')
    let userData = null
    if (snapshot.exists()) {
      userData = snapshot.val()
    } else {
      userData = {'name': state.userName, 'input': ''}
    }
    const user_updates = {
      ['/members/'+state.authID+'/rooms/'+state.roomName]: null,
      ['/rooms/'+state.roomName+'/members/'+state.authID]: null
    }
    await firebase.database().ref(GROUP).update(user_updates)
    return userData
  },
  startSchedule ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/schedule').set({
      'time': payload.seconds,
      'start': firebase.database.ServerValue.TIMESTAMP
    })
  },
  stopSchedule ({commit, state}, payload) {
    if (!state.groupName || !state.authID || !state.connectStatus) return
    const GROUP = 'groups/' + state.groupName + '_' + genHash(state.password)
    firebase.database().ref(GROUP+'/rooms/'+state.roomName+'/schedule').set({
      'time': 0,
      'start': 0
    })
  },
  // -----
  openManagePage ({commit, state}, payload) {
    if (state.subWindowID && !state.subWindowID.closed) return
    const _id = window.open('/#/manage', 'ManagementPage', 'width=700,height=400')
    commit('setSubWindow', {id: _id})
  },
  sendManageID ({commit, state}, payload) {
    setTimeout(() => {
      state.subWindowID.postMessage('MANAGE::' + payload.id, location.origin)
      state.subWindowID.postMessage('PARENT::' + state.authID, location.origin)
    }, 500)
  },
  manageAuthenticate ({commit, state}, payload) {
  }
}

const mutations = {
  initializeStatus (state, payload) {
    state.groupName = ''
    state.password = ''
    state.userName = ''
    state.roomName = ''
    state.roommates = []
    state.texts = [['\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', 'default']]
    state.chatTexts = []
    state.newChat = false
    state.newGlobalChat = false
  },
  setLoginFailed (state, payload) {
    state.loginFailed = payload
  },
  setGroupName (state, payload) {
    state.groupName = payload
  },
  setPassword (state, payload) {
    state.password = payload
  },
  changeMethodType (state, payload) {
    state.methodType = payload
  },
  setConnectStatus (state, payload) {
    if (state.connectStatus !== payload) {
      state.connectStatus = payload
    }
  },
  setUserName (state, payload) {
    state.userName = payload
  },
  setRoomName (state, payload) {
    state.roomName = payload
  },
  initText (state, payload) {
    state.texts = [['\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', 'default']]
  },
  addText (state, payload) {
    state.texts.push([payload.text, payload.id])
  },
  updateText (state, payload) {
    let newTexts = state.texts
    let idx = newTexts.findIndex((item) => item[1] == payload.id)
    if (idx==-1) return
    newTexts[idx] = [payload.text, payload.id]
    state.texts = []
    state.texts = newTexts
  },
  removeText (state, payload) {
    state.texts = state.texts.filter((item) => {return item[1] != payload.id})
  },
  setAuthID (state, payload) {
    state.authID = payload
  },
  initRoommate (state, payload) {
    state.roommates = []
  },
  addRoommate (state, payload) {
    if (payload.id == state.authID) return
    state.roommates.push(payload)
  },
  updateRoommate (state, payload) {
    if (payload.id == state.authID) return
    let newRoommates = state.roommates
    let idx = newRoommates.findIndex((item) => item.id == payload.id)
    if (idx==-1) return
    newRoommates[idx] = payload
    state.roommates = []
    state.roommates = newRoommates
  },
  removeRoommate (state, payload) {
    if (payload.id == state.authID) return
    state.roommates = state.roommates.filter((item) => {return item.id != payload.id})
  },
  setNewChat (state, payload) {
    state.newChat = payload
  },
  setNewGlobalChat (state, payload) {
    state.newGlobalChat = payload
  },
  initChatText (state, payload) {
    state.chatTexts = []
  },
  addChatText (state, payload) {
    state.chatTexts.push(payload)
  },
  setSchedule (state, payload) {
    if (payload.type === 'start' && !state.scheduleState) {
      state.scheduleState = true
      state.scheduleTime = payload.now
      state.scheduleID = setInterval(() => {
        state.scheduleTime -= 1
        if (state.scheduleTime === 30) {
          // addChatText
          state.chatTexts.push('30秒前です')
        }
        if (state.scheduleTime === 0) {
          state.scheduleTime = payload.seconds
          // addChatText
          state.chatTexts.push('交代です！')
        }
      }, 1000)
    }
    if (payload.type === 'stop') {
      state.scheduleState = false
      clearInterval(state.scheduleID)
      state.scheduleTime = 0
    }
  },
  echoServer (state, payload) {
    if (payload.type === 'req') {
      state.startTime = new Date().getTime()
      console.log('-> send echo')
      // state.socket.emit('echo', {ping: state.echoTime})
    } else if (payload.type === 'res') {
      state.echoTime = new Date().getTime() - state.startTime
    }
  },
  // ----------
  addEchoQueue (state, payload) {
    state.echoQueue.push(payload)
  },
  setEchoTime (state, payload) {
    let idx = state.echoQueue.findIndex((el) => el[0] === payload.hash)
    if (idx === -1) return
    state.echoTime = new Date().getTime() - state.echoQueue[idx][1]
    state.echoQueue.splice(idx, 1)
  },
  // ----------
  setFKey (state, payload) {
    state.fkey = payload.fkey
  },
  setUndoneText (state, payload) {
    state.undoneText = payload
  },
  resetUndoneText (state, payload) {
    state.undoneText = ''
  },
  delete1Char (state, payload) {
    let idx = state.texts.findIndex((item) => item[1] === payload.text_id)
    let text = state.texts[idx][0].slice(0, -1)
    let id = state.texts[idx][1]
    state.texts.splice(idx, 1)
    if (text.length === 0) state.texts.splice(idx, 1)
    else state.texts.splice(idx, 1, [text, id])
  },
  setFocusTyping (state, payload) {
    state.focusTyping = payload
  },
  // ----------
  setSubWindow (state, payload) {
    state.subWindowID = payload.id
  },
  setManageData (state, payload) {
    // let newData = {}
    // for (var user of payload.data) {
    // }
    state.manageData = payload.data
  },
  // ----------
  setPageTransition (state, payload) {
    state.pageTransition = payload.state
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
