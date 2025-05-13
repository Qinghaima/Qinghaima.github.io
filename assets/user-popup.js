function togglePopup() {
  const popup = document.getElementById('popup-card');
  popup?.classList.toggle('hidden');
}

document.addEventListener('click', function (event) {
  const avatar = document.querySelector('.avatar');
  const popup = document.getElementById('popup-card');
  if (!avatar?.contains(event.target)) {
    popup?.classList.add('hidden');
  }
});

function logoutUser() {
  firebase.auth().signOut().then(() => {
    location.reload();
  });
}

firebase.auth().onAuthStateChanged(user => {
  const popup = document.getElementById('popup-card');
  if (!popup) return;

  if (user) {
    const displayName = user.displayName || '未设置';
    const email = user.email;
    const truncatedEmail = email.length > 20 ? email.slice(0, 10) + '...' + email.slice(-7) : email;
    const truncatedName = displayName.length > 16 ? displayName.slice(0, 8) + '...' + displayName.slice(-4) : displayName;

    popup.innerHTML = `
      <p style="font-weight:bold;" title="${email}">
        <span data-fulltext="${email}">${truncatedEmail}</span>
      </p>
      <p title="${displayName}">用户名：<span data-fulltext="${displayName}">${truncatedName}</span></p>
      <hr>
      <a href="#">个人主页</a><br>
      <a href="#">通知</a><br>
      <a href="#" onclick="logoutUser()">退出</a>
    `;
  } else {
    popup.innerHTML = `
      <h3>欢迎使用！</h3>
      <ul>
        <li><a href="login.html">登录</a></li>
        <li><a href="register.html">注册</a></li>
      </ul>
    `;
  }
});
