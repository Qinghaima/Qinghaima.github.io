const db = firebase.firestore();
const storage = firebase.storage();

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    alert("请先登录！");
    return;
  }

  const uid = user.uid;
  const docRef = db.collection("users").doc(uid);

  // 加载资料
  docRef.get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById('display-name').value = data.displayName || '';
      document.getElementById('bio').value = data.bio || '';
      if (data.avatarUrl) {
        document.getElementById('avatar-preview').src = data.avatarUrl;
      }
    }
  });

  // 上传头像并保存资料
  window.saveProfile = async function () {
    const displayName = document.getElementById('display-name').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const file = document.getElementById('avatar-input').files[0];

    let avatarUrl = document.getElementById('avatar-preview').src;

    if (file) {
      const path = `avatars/${uid}.jpg`;
      const snapshot = await storage.ref(path).put(file);
      avatarUrl = await snapshot.ref.getDownloadURL();
    }

    await docRef.set({
      displayName,
      bio,
      avatarUrl
    });

    document.getElementById('avatar-preview').src = avatarUrl;
    document.getElementById('save-result').style.display = 'block';
    setTimeout(() => {
      document.getElementById('save-result').style.display = 'none';
    }, 2000);
  };
});
