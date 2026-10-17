/* Cloud integration for Kedai Kita. Optional CDN Firebase SDK; local game works without config. */
const FIREBASE_VERSION = '13.0.0';
const GUEST_KEY = 'kedai-kita-v1';
const ACCOUNT_KEY = uid => `kedai-kita-user-${uid}-v1`;
const byId = id => document.getElementById(id);
const trim = value => String(value ?? '').trim();
const configValid = config => !!(config?.apiKey && config?.projectId && config?.appId && /^https:\/\//.test(config?.databaseURL || '') && !Object.values(config).some(v => String(v).includes('PASTE_')));
const clone = data => JSON.parse(JSON.stringify(data));

const errorMalay = error => {
  const codes = {
    'auth/email-already-in-use': 'E-mel ini sudah didaftarkan. Sila log masuk.',
    'auth/invalid-email': 'Alamat e-mel tidak sah.',
    'auth/invalid-credential': 'E-mel atau kata laluan tidak tepat.',
    'auth/wrong-password': 'Kata laluan tidak tepat.',
    'auth/user-not-found': 'Akaun tidak dijumpai.',
    'auth/weak-password': 'Kata laluan terlalu pendek. Gunakan sekurang-kurangnya 6 aksara.',
    'auth/too-many-requests': 'Terlalu banyak percubaan. Cuba lagi kemudian.',
    'auth/network-request-failed': 'Tiada sambungan rangkaian. Periksa internet.',
    'auth/operation-not-allowed': 'Sistem daftar masuk belum diaktifkan. Hubungi pengendali permainan.',
    'auth/unauthorized-domain': 'Log masuk belum dibenarkan untuk laman ini. Hubungi pengendali permainan.',
    'PERMISSION_DENIED': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'permission-denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'database/permission-denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'database/permission_denied': 'Akses simpanan ditolak. Pastikan Rules telah dipublish di Realtime Database.',
    'unavailable': 'Simpanan dalam talian tidak dapat dihubungi. Cuba lagi apabila talian pulih.',
    'database/unavailable': 'Pangkalan data tidak dapat dihubungi. Semak sambungan.',
    'database/network-error': 'Masalah rangkaian semasa membaca simpanan.',
    'database/offline': 'Sambungan pangkalan data terputus. Sambung internet dahulu.'
  };
  return codes[error?.code] || 'Terdapat masalah dengan akaun atau sambungan. Cuba lagi sebentar.';
};
const errorCode = error => String(error?.code || error?.name || 'UNKNOWN').replace(/[^a-zA-Z0-9/_:-]/g,'').slice(0,80);

const readLocal = key => {try {return JSON.parse(localStorage.getItem(key)||'null')} catch {return null}};
const writeLocal = (key, state) => {try {localStorage.setItem(key, JSON.stringify(state));return true} catch {return false}};
const isMeaningful = data => !!(data && (data?.progress?.day > 1 || data?.progress?.served > 0 || data?.progress?.wallet > 0 || data?.session));

export function createCloudSync({capture, hydrate, pauseForAccount, report}) {
  const overlay = byId('accountOverlay');
  const ui = {
    title: byId('accountTitle'), hint: byId('accountHint'), message: byId('accountMessage'),
    form: byId('accountForm'), email: byId('accountEmail'), password: byId('accountPassword'),
    submit: byId('accountSubmit'), login: byId('accountLoginTab'), register: byId('accountRegisterTab'),
    reset: byId('accountReset'), guest: byId('accountGuest'), close: byId('accountClose'),
    logout: byId('accountLogout'), current: byId('accountCurrent'), import: byId('accountImport'),
    fresh: byId('accountFresh'), retry: byId('accountRetry'),
    authFields: byId('accountAuthFields'), choice: byId('accountChoice'),
    overview: byId('accountOverview'), controls: byId('accountControls')
  };
  let api = null, auth = null, db = null, user = null, ready = false;
  let guestMode = false, busy = false, mode = 'login', currentKey = GUEST_KEY;
  let timer = null, queued = null, writing = false, writesPending = null, epoch = 0;
  let syncError = null, configEnabled = false, started = false, saveCounter = 0;
  let activeSessionToken = null, watchSessionStop = null, newCredentialLogin = false;
  let kickedForOtherDevice = false, kickingOut = false;
  const sessionPath = uid => api.ref(db, `activeSessions/${uid}`);
  const browserSessionKey = uid => `kk-active-session-${uid}`;
  const makeSessionToken = () => {
    if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes=new Uint8Array(32);globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  };
  const detachSessionWatch=()=>{if(watchSessionStop){watchSessionStop();watchSessionStop=null}};
  const clearSessionLocal=uid=>{try{sessionStorage.removeItem(browserSessionKey(uid))}catch{}};
  const saveSessionLocal=(uid,token)=>{try{sessionStorage.setItem(browserSessionKey(uid),token)}catch{}};
  const getSessionLocal=uid=>{try{return sessionStorage.getItem(browserSessionKey(uid))}catch{return null}};

  const setStatus = value => {report(value);const el=byId('accountSyncLabel');if(el)el.textContent=value;};
  const message = (value='', isError=false) => {ui.message.textContent=value;ui.message.classList.toggle('error', isError)};
  const show = () => {
    if(overlay.open)overlay.close();
    overlay.showModal();document.body.classList.add('account-locked');
  };
  const hide = () => {if(overlay.open)overlay.close();document.body.classList.remove('account-locked')};
  const showRegion = region => {
    ui.authFields.hidden=region!=='auth'; ui.overview.hidden=region!=='overview'; ui.choice.hidden=region!=='choice';
    ui.controls.hidden=region==='loading'; ui.guest.hidden=region==='overview'||region==='choice'||(region==='error'&&!!user);
    ui.close.hidden=region!=='overview'; ui.logout.hidden=region!=='overview'&&region!=='error';
    ui.retry.hidden=region!=='error';
  };
  const showLogin = (hint='Log masuk untuk simpan dan sambung permainan pada peranti lain.') => {
    show();showRegion('auth');ui.title.textContent='Selamat kembali!';ui.hint.textContent=hint;
    ui.guest.hidden=false;message('');setMode('login');
  };
  const showLoading = hint => {show();showRegion('loading');ui.title.textContent='Menyediakan kedai anda';ui.hint.textContent=hint;message('')};
  const showOverview = () => {
    show();showRegion('overview');ui.title.textContent='Akaun Kedai Kita';ui.hint.textContent='Progres kerjaya disimpan mengikut akaun ini.';
    ui.current.textContent=user?.email||'Akaun pemain';message(syncError?errorMalay(syncError):'Data akaun anda telah dimuatkan.');
  };
  const setMode = selected => {
    mode=selected; ui.login.classList.toggle('active',selected==='login');
    ui.register.classList.toggle('active',selected==='register');
    ui.submit.textContent=selected==='register'?'Daftar akaun':'Log masuk';
    ui.password.autocomplete=selected==='register'?'new-password':'current-password';
    ui.reset.hidden=selected==='register';
  };
  const setBusy = flag => {
    busy=flag;for(const e of [ui.submit,ui.login,ui.register,ui.reset,ui.guest,ui.logout,ui.import,ui.fresh,ui.retry])e.disabled=flag;
    ui.submit.textContent=flag?'Sila tunggu…':mode==='register'?'Daftar akaun':'Log masuk';
  };
  const localAccount = uid => readLocal(ACCOUNT_KEY(uid));
  const snapshotRef = uid => api.ref(db,`users/${uid}/games/kedai-kita`);
  async function sessionReplaced(uid){
    if(kickingOut||!user||user.uid!==uid)return;
    kickingOut=true;kickedForOtherDevice=true;ready=false;queued=null;syncError=null;
    clearTimeout(timer);timer=null;detachSessionWatch();activeSessionToken=null;clearSessionLocal(uid);
    // Keep an unsynced local account snapshot intact for safe recovery
    // if the player logs in again. Never overwrite it during sign-out.
    setStatus('Sesi akaun tamat');
    try{await api.signOut(auth)}catch{}
    showLogin('Akaun ini telah log masuk pada peranti lain.');
    ui.guest.hidden=true;
    message('Sesi pada peranti ini telah ditamatkan. Masukkan e-mel dan kata laluan semula untuk log masuk.',true);
    kickingOut=false;
  }
  async function claimSession(uid,replaceExisting){
    detachSessionWatch();activeSessionToken=null;
    let token;
    if(replaceExisting){
      token=makeSessionToken();
      // A confirmed server write becomes this account's active session.
      // The other device is signed out by its realtime session watcher.
      await api.set(sessionPath(uid),{token,startedAt:api.serverTimestamp()});
      const confirm=await api.get(sessionPath(uid));
      if(confirm.val()?.token!==token){await sessionReplaced(uid);return false}
      saveSessionLocal(uid,token);
    }else{
      token=getSessionLocal(uid);
      if(!token){await sessionReplaced(uid);return false}
      const result=await api.get(sessionPath(uid));
      if(!result.exists()||result.val()?.token!==token){await sessionReplaced(uid);return false}
    }
    activeSessionToken=token;
    watchSessionStop=api.onValue(sessionPath(uid),snapshot=>{
      if(user?.uid===uid && activeSessionToken===token && snapshot.val()?.token!==token){
        sessionReplaced(uid);
      }
    },err=>{if(user?.uid===uid)setStatus('Sesi tidak dapat disemak · semak sambungan')});
    return true;
  }
  async function releaseSession(uid,token){
    if(!token)return;
    try{await api.runTransaction(sessionPath(uid),current=>current?.token===token?null:undefined,{applyLocally:false})}catch{}
  }

  const setIdentity = next => {
    user=next;ready=false;currentKey=next?ACCOUNT_KEY(next.uid):GUEST_KEY;
    const e=byId('accountBtnText');if(e)e.textContent=next?'Akaun ✓':'Akaun';
  };
  const stage = state => {
    queued=clone(state);delete queued._cloudPending;
    setStatus('Menyimpan progres…');if(!timer)timer=setTimeout(flush,3000);
  };
  async function flush() {
    if(timer){clearTimeout(timer);timer=null}
    if(writing||!ready||!user||!queued||!api||!activeSessionToken)return;
    const uid=user.uid, value=queued;queued=null;writing=true;
    try {
      if(!activeSessionToken){throw new Error('Sesi akaun tidak aktif')}
      writesPending=api.set(snapshotRef(uid),{version:1,state:value,sessionToken:activeSessionToken,updatedAt:api.serverTimestamp()});
      await writesPending;
      if(user?.uid===uid){
        const local=localAccount(uid);
        if(local?._clientStamp===value._clientStamp){local._cloudPending=false;writeLocal(ACCOUNT_KEY(uid),local)}
        syncError=null;setStatus(queued?'Menyimpan progres…':'✓ Progres disimpan');
      }
    } catch(err) {
      if(user?.uid===uid){syncError=err;queued=queued||value;setStatus('Simpanan belum disegerakkan · progres selamat di peranti')}
    } finally {
      writing=false;writesPending=null;
      if(queued&&user?.uid===uid&&!syncError)timer=setTimeout(flush,3000);
    }
  }
  function queueSave(state) {
    const data=clone(state);
    if(user){data._cloudPending=true;data._clientStamp=`${Date.now()}-${++saveCounter}`}
    writeLocal(currentKey,data);
    if(ready&&user&&activeSessionToken&&!syncError)stage(data);
    else if(ready&&!user)setStatus('Disimpan pada peranti · mod tetamu');
  }
  async function finishAccount(state) {
    hide();hydrate(state);ready=true;writeLocal(currentKey,state||capture());setStatus('✓ Progres akaun dimuatkan');
  }
  async function onSignedIn(next, token, retryNewSession=false) {
    setIdentity(next);guestMode=false;showLoading('Menyemak sesi dan progres akaun…');
    let loadStep='membuka sesi akaun';
    try {
      const valid=await claimSession(next.uid,newCredentialLogin||retryNewSession);
      newCredentialLogin=false;
      if(!valid||token!==epoch||user?.uid!==next.uid)return;
      loadStep='membaca progres permainan';
      const result=await api.get(snapshotRef(next.uid));
      if(token!==epoch||user?.uid!==next.uid)return;
      const remote=result.exists()?result.val()?.state:null;
      const saved=localAccount(next.uid);
      // A successful local game save may have been interrupted before its Realtime Database upload.
      // Prefer that account's pending local save, never an unrelated guest account save.
      if(remote?.progress && saved?._cloudPending && saved?.progress){
        await finishAccount(saved);queueSave(capture());return;
      }
      if(remote?.progress) {
        await finishAccount(remote);
        setStatus('✓ Progres akaun dimuatkan');
        return;
      }
      if(saved?.progress){await finishAccount(saved);queueSave(capture());return}
      const old=readLocal(GUEST_KEY);
      if(isMeaningful(old)) {
        show();showRegion('choice');ui.title.textContent='Pilih simpanan pertama';
        ui.hint.textContent='Ada progres lama pada peranti ini. Pilih untuk pindahkan ke akaun, atau mula baharu.';
        message('Data lama kekal pada peranti sehingga anda pilih untuk mengimportnya.');
        ui.import.onclick=()=>{if(!user||busy)return;finishAccount(old).then(()=>queueSave(capture()))};
        ui.fresh.onclick=()=>{if(!user||busy)return;finishAccount(null).then(()=>queueSave(capture()))};
        return;
      }
      await finishAccount(null);queueSave(capture());
    } catch(err) {
      if(token!==epoch)return;
      newCredentialLogin=false;
      syncError=err;setStatus('Simpanan tidak dapat diakses');show();showRegion('error');
      ui.title.textContent='Tidak dapat muat simpanan';ui.hint.textContent='Progres anda tidak dipadam. Semak ralat di bawah atau cuba sambung semula.';
      message(`${errorMalay(err)} (Kod: ${errorCode(err)} · ${loadStep})`,true);
      ui.retry.onclick=()=>{
        if(!user){showLogin('Sila log masuk semula.');return}
        syncError=null;
        // If creating a new session failed, retry the claim; never
        // incorrectly treat an empty sessionStorage token as a second device.
        const needsNewSession=!getSessionLocal(user.uid);
        onSignedIn(user,epoch,needsNewSession);
      };
    }
  }
  async function onAuthChange(next) {
    const token=++epoch;
    queued=null;if(timer){clearTimeout(timer);timer=null}
    if(next){await onSignedIn(next,token);return}
    detachSessionWatch();activeSessionToken=null;
    setIdentity(null);hydrate(readLocal(GUEST_KEY));ready=true;syncError=null;
    setStatus('Disimpan pada peranti · mod tetamu');
    if(kickedForOtherDevice){showLogin('Akaun ini telah digunakan pada peranti lain.');ui.guest.hidden=true;message('Log masuk semula menggunakan kata laluan untuk terus bermain.',true)}
    else if(guestMode)hide();else showLogin();
  }
  function openAccount() {
    pauseForAccount();
    if(user&&ready)showOverview();
    else if(configEnabled)showLogin();
    else {showLogin('Sistem akaun belum tersedia. Sila cuba kemudian.');ui.submit.disabled=true;ui.register.disabled=true;ui.login.disabled=true;ui.reset.disabled=true;}
  }
  async function logOut() {
    if(!auth||!user)return;
    setBusy(true);message('Menyimpan progres sebelum log keluar…');
    if(queued)await flush();if(writesPending)try{await writesPending}catch{}
    ready=false;guestMode=false;
    const uid=user.uid,token=activeSessionToken;
    detachSessionWatch();activeSessionToken=null;clearSessionLocal(uid);
    await releaseSession(uid,token);
    try{await api.signOut(auth)}catch(err){ready=true;showOverview();message(errorMalay(err),true)}
    setBusy(false);
  }
  function initControls() {
    ui.login.onclick=()=>{setMode('login');message('')};ui.register.onclick=()=>{setMode('register');message('')};
    ui.close.onclick=hide;overlay.addEventListener('cancel',e=>{e.preventDefault()});
    ui.guest.onclick=()=>{if(user)return;guestMode=true;ready=true;hide();setStatus('Disimpan pada peranti · mod tetamu')};
    ui.logout.onclick=logOut;
    ui.form.onsubmit=async e=>{
      e.preventDefault();if(!auth||busy)return;
      const email=trim(ui.email.value),password=ui.password.value;
      if(!email||password.length<6){message('Masukkan e-mel sah dan kata laluan sekurang-kurangnya 6 aksara.',true);return}
      setBusy(true);message('Sedang '+(mode==='register'?'mendaftar':'log masuk')+'…');
      try {
        kickedForOtherDevice=false;newCredentialLogin=true;
        if(mode==='register')await api.createUserWithEmailAndPassword(auth,email,password);
        else await api.signInWithEmailAndPassword(auth,email,password);
        ui.password.value='';message('Berjaya. Menyediakan data permainan…');
      } catch(err){newCredentialLogin=false;message(errorMalay(err),true)}finally{setBusy(false)}
    };
    ui.reset.onclick=async()=>{
      const email=trim(ui.email.value);if(!email){message('Isi e-mel anda dahulu untuk tetapkan semula kata laluan.',true);return}
      setBusy(true);try{await api.sendPasswordResetEmail(auth,email);message('Jika e-mel ini didaftarkan, arahan set semula kata laluan akan dihantar.')}catch(err){message(errorMalay(err),true)}finally{setBusy(false)}
    };
    byId('accountBtn').onclick=openAccount;
  }
  async function start() {
    if(started)return;started=true;initControls();
    window.addEventListener('online',()=>{
      if(!user||!ready)return;
      const pending=localAccount(user.uid);
      if(pending?._cloudPending){syncError=null;stage(pending)}
    });
    showLoading('Menyemak sambungan akaun…');
    const config=window.KEDAI_FIREBASE_CONFIG;
    configEnabled=configValid(config);
    if(!configEnabled){ready=true;setStatus('Akaun belum tersedia · mod tetamu');openAccount();return}
    try {
      const path=`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
      const [appModule,authModule,databaseModule]=await Promise.all([
        import(path+'firebase-app.js'),import(path+'firebase-auth.js'),import(path+'firebase-database.js')
      ]);
      const app=appModule.initializeApp(config);
      api={...authModule,...databaseModule};
      auth=authModule.getAuth(app);db=databaseModule.getDatabase(app);
      authModule.onAuthStateChanged(auth,onAuthChange,err=>{showLogin('Sambungan login bermasalah. Cuba muat semula halaman.');message(errorMalay(err),true)});
    } catch(err) {
      configEnabled=false;ready=true;
      setStatus('Sistem akaun tidak dapat dimuatkan');showLogin('Sistem akaun tidak dapat dimuatkan. Semak sambungan internet.');message(errorMalay(err),true);
      ui.submit.disabled=true;ui.register.disabled=true;ui.login.disabled=true;ui.reset.disabled=true;
    }
  }
  return {start, queueSave, flush, openAccount, getStorageKey:()=>currentKey, getUser:()=>user};
}
