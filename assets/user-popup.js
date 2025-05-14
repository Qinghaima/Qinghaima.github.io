document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();

  // 切换弹窗显示/隐藏
  function togglePopup() {
    const popup = document.getElementById('popup-card');
    popup.classList.toggle('hidden');
  }

  // 点击页面其他区域关闭弹窗
  document.addEventListener('click', function (event) {
    const avatar = document.querySelector('.avatar');
    const popup = document.getElementById('popup-card');
    if (!avatar || !popup) return;
    if (!avatar.contains(event.target)) {
      popup.classList.add('hidden');
    }
  });

  // 退出登录
  window.logoutUser = function () {
    firebase.auth().signOut().then(() => {
      location.reload();
    });
  };

  // 登录状态处理
  firebase.auth().onAuthStateChanged(user => {
    const popup = document.getElementById('popup-card');
    const avatarImg = document.querySelector(".avatar img");
    if (!popup || !avatarImg) return;

    if (user) {
      const email = user.email || "未知邮箱";
      const name = user.displayName || "未设置";

      // Firestore 头像优先
      db.collection("profiles").doc(user.uid).get().then(doc => {
        if (doc.exists && doc.data().avatar) {
          avatarImg.src = doc.data().avatar;
        } else if (user.photoURL) {
          avatarImg.src = user.photoURL;
        }
      });

      popup.innerHTML = `
        <p style="font-weight:bold;" title="${email}">
          <span data-fulltext="${email}">${email}</span>
        </p>
        <p title="${name}">用户名：<span data-fulltext="${name}">${name}</span></p>
        <hr>
        <a href="profile.html">个人主页</a><br>
        <a href="#">通知</a><br>
        <a href="#" onclick="logoutUser()">退出</a>
      `;
    } else {
      popup.innerHTML = `
        <h3>欢迎使用！</h3>
        <p>请登录或注册使用更多功能。</p>
      `;
    }
  });

  // 暴露函数
  window.togglePopup = togglePopup;
});
