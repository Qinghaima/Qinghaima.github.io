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

  // 设置头像上传和资料保存的主函数
  window.uploadAvatar = async function () {
    const displayName = document.getElementById('display-name').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const file = document.getElementById('avatar-input').files[0];

    let avatarUrl = document.getElementById('avatar-preview').src;

    // 如果选择了文件，先上传头像
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("图片太大，请选择小于1MB的图片！");
        return;
      }

      const img = new Image();
      img.onload = async () => {
        if (img.width !== img.height) {
          alert("请上传正方形图片！");
          return;
        }

        try {
          const path = `avatars/${uid}.jpg`;
          const snapshot = await storage.ref(path).put(file);
          avatarUrl = await snapshot.ref.getDownloadURL();

          // 更新 Firestore
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
        } catch (err) {
          alert("上传失败：" + err.message);
        }
      };
      img.src = URL.createObjectURL(file);
    } else {
      // 没有头像，仅保存文字信息
      await docRef.set({
        displayName,
        bio,
        avatarUrl
      });

      document.getElementById('save-result').style.display = 'block';
      setTimeout(() => {
        document.getElementById('save-result').style.display = 'none';
      }, 2000);
    }
  };
});
