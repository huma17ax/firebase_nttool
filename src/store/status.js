import io from 'socket.io-client'
import JsSHA from 'jssha'
import ip from './ip'
import router from '@/router/index.js'

function genHash () {
  let date = (new Date()).valueOf.toString()
  let random = Math.random().toString()
  const shaObj = new JsSHA('SHA-256', 'TEXT')
  shaObj.update(date + random)
  return shaObj.getHash('HEX')
}

const state = {
  socket: io(ip.address),
  // socket: io('localhost:20080'),
  connectStatus: false,
  userName: 'default',
  roomName: 'default',
  userID: '',
  authority: '',
  texts: [['||||||||||||||||||||||||||||||', 'default']],
  chatTexts: [],
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
  scheduleState: false,
  scheduleTime: 0,
  scheduleID: undefined,
  roomStatus: {},
  echoTime: -1,
  echoQueue: [],
  startTime: 0,
  methodType: '1',
  // ----------
  subWindowID: undefined,
  manageData: [],
  //
  pageTransition: undefined
}

const getters = {
  texts (state) {
    let ret = state.texts.map((item) => { return item[0] }).join('').split('|')
    ret[ret.length - 1] += '■'
    return ret
  },
  roomMembers (state) {
    return Object.entries(state.roomStatus)
      .sort((a, b) => a[0] - b[0])
      .map((item) => { return item[1] })
  },
  scheduleTime (state) {
    return Math.floor(state.scheduleTime / 60) + '分' + (state.scheduleTime % 60) + '秒'
  }
}

const actions = {
  synchronizeText ({commit, state}, payload) {
    if (payload.type === 'req') {
      let hash = genHash()
      state.socket.emit('syn', {text: payload.content, hashforecho: hash, ping: state.echoTime})
      commit('addEchoQueue', [hash, new Date().getTime()])
    } else {
      commit('setEchoTime', {hash: payload.hash})
    }
  },
  loginSuccess ({commit, state}, payload) {
    commit('setUserID', {id: payload.id})
    commit('setAuthority', {authority: payload.authority})
    console.log(payload.route.path)
    if (payload.route.path !== '/chat' && payload.route.path !== '/setting' && payload.route.path !== '/manage') router.push('/chat')
    if (state.userName !== 'default' || state.roomName !== 'default') {
      console.log('old name')
      state.socket.emit('join_room', state.roomName)
      state.socket.emit('change_name', state.userName)
    }
  },
  autoLogin ({commit, state}, payload) {
    if (payload && payload.route && payload.route.path === '/manage') return
    if (localStorage.pass) {
      state.socket.emit('login', {id: localStorage.pass})
      console.log('-> send AUTO login request')
    }
  },
  logout ({commit, state}, payload) {
    state.socket.emit('logout')
    commit('setUserID', {id: ''})
    commit('setAuthority', {authority: ''})
    commit('deleteLoginPass', {})
    payload.router.push('/').catch(err => { console.log(err) })
  },
  // -----
  openManagePage ({commit, state}, payload) {
    if (state.subWindowID && !state.subWindowID.closed) return
    const _id = window.open('/#/manage', 'ManagementPage', 'width=700,height=400')
    commit('setSubWindow', {id: _id})
    state.socket.emit('manage_request')
  },
  sendManageID ({commit, state}, payload) {
    setTimeout(() => {
      state.subWindowID.postMessage('MANAGE::' + payload.id, location.origin)
      state.subWindowID.postMessage('PARENT::' + state.userID, location.origin)
    }, 500)
  },
  manageAuthenticate ({commit, state}, payload) {
    state.socket.emit('manage_auth', {parent: payload.parent, id: payload.id})
  }
}

const mutations = {
  changeMethodType (state, payload) {
    state.methodType = payload
  },
  setSocketHandler (state, payload) {
    state.socket.on(payload.event, payload.callback)
  },
  setConnectStatus (state, payload) {
    if (state.connectStatus !== payload.status) {
      state.connectStatus = payload.status
      if (payload.status === false) {
        state.echoTime = -1
      }
    }
  },
  setUserName (state, payload) {
    state.userName = payload.userName
  },
  setRoomName (state, payload) {
    state.roomName = payload.roomName
  },
  setAuthority (state, payload) {
    state.authority = payload.authority
  },
  addText (state, payload) {
    state.texts.push([payload.text, payload.id])
  },
  setUserID (state, payload) {
    state.userID = payload.id
    if (state.userID in state.roomStatus) {
      delete state.roomStatus[state.userID]
    }
  },
  setLoginPass (state, payload) {
    localStorage.pass = payload.pass
  },
  deleteLoginPass (state, payload) {
    localStorage.removeItem('pass')
  },
  setRoomStatus (state, payload) {
    let newStatus = {}
    for (var user of payload.status) {
      if (user.id === state.userID) continue
      if (user.id in state.roomStatus) {
        newStatus[user.id] = {name: user.name, input: state.roomStatus[user.id].input}
      } else {
        newStatus[user.id] = {name: user.name, input: ''}
      }
    }
    state.roomStatus = newStatus
  },
  setMemberText (state, payload) {
    if (payload.id in state.roomStatus) {
      state.roomStatus[payload.id].input = payload.text
    }
  },
  addChatText (state, payload) {
    state.chatTexts.push(payload.text)
  },
  setSchedule (state, payload) {
    if (payload.type === 'start') {
      state.scheduleState = true
      state.scheduleTime = payload.minutes * 60
      state.scheduleID = setInterval(() => {
        state.scheduleTime -= 1
        if (state.scheduleTime === 30) {
          // addChatText
          state.chatTexts.push('30秒前です')
        }
        if (state.scheduleTime === 0) {
          state.scheduleTime = payload.minutes * 60
          // addChatText
          state.chatTexts.push('交代です！')
        }
      }, 1000)
    } else {
      state.scheduleState = false
      clearInterval(state.scheduleID)
      state.scheduleTime = 0
    }
  },
  echoServer (state, payload) {
    if (payload.type === 'req') {
      state.startTime = new Date().getTime()
      console.log('-> send echo')
      state.socket.emit('echo', {ping: state.echoTime})
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
  undoText (state, payload) {
    let idx = state.texts.findIndex((item) => item[1] === payload.text_id)
    if (payload.user === state.userID) {
      state.undoneText = state.texts[idx][0]
    }
    state.texts.splice(idx, 1)
    console.log(state.undoneText)
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
