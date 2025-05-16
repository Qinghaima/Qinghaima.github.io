// 引入 Firebase 模块（这部分保留在 HTML 里）
// 这部分内容不要放进 firebase-init.js
// <script src="https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyBC262GHqTJxk61mLAB6sIH9KFD6NfMtLQ",
  authDomain: "rinka-site-5a986.firebaseapp.com",
  projectId: "rinka-site-5a986",
  storageBucket: "rinka-site-5a986.appspot.com",
  messagingSenderId: "85571120840",
  appId: "1:85571120840:web:0d7602aefb667f814f3ffd",
  measurementId: "G-C81RQBJECD"
};

firebase.initializeApp(firebaseConfig);
// 显式初始化 Firestore（有些版本不加这一句会访问失败）
firebase.firestore();
