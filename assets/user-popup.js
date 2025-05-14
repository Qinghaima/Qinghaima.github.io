document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();

  function togglePopup() {
    const popup = document.getElementById('popup-card');
    popup.classList.toggle('hidden');
  }

  document.addEventListener('click', function (event) {
    const avatar = document.querySelector('.avatar');
    const popup = document.getElementById('popup-card');
    if (!avatar || !popup) return;
    if (!avatar.contains(event.target)) {
      popup.classList.add('hidden');
    }
  });

  window.logoutUser = function () {
    firebase.auth().signOut().then(() => {
      location.reload();
    });
  };

  firebase.auth().onAuthStateChanged(user => {
    const popup = document.getElementById('popup-card');
    const avatarImg = document.querySelector(".avatar img");
    if (!popup || !avatarImg) return;

    if (user) {
      const email = user.email || "未知邮箱";
      const name = user.displayName || "未设置";

      db.collection("profiles").doc(user.uid).get().then(doc => {
        if (doc.exists && doc.data().avatar) {
          avatarImg.src = doc.data().avatar;
        } else if (user.photoURL) {
          avatarImg.src = user.photoURL;
        }
      });

      popup.innerHTML = `
        <p class="popup-line">
          邮箱：
          <span class="ellipsis-container" title="${email}">${email}</span>
        </p>
        <p class="popup-line">
          用户名：
          <span class="ellipsis-container" title="${name}">${name}</span>
        </p>
        <hr>
        <a href="profile.html">个人主页</a><br>
        <a href="#">通知</a><br>
        <a href="#" onclick="logoutUser()">退出</a>
      `;
    } else {
      popup.innerHTML = `
        <h3>欢迎使用！</h3>
        <p><a href="login.html" style="color: #007acc;">登录</a> 或 <a href="register.html" style="color: #007acc;">注册</a></p>
      `;
    }
  });

  window.togglePopup = togglePopup;
});
