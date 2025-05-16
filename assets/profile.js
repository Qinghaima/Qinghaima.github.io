const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

let selectedFile = null;
let lastAvatarChange = null;
let lastNameChange = null;

// 监听文件选择并预览图片
export function bindAvatarUpload(inputId, previewImgId) {
  document.getElementById(inputId).addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("图片太大，请选择小于1MB的图片！");
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width !== img.height) {
        alert("请上传正方形图片！");
        return;
      }
      selectedFile = file;
      document.getElementById(previewImgId).src = URL.createObjectURL(file);
    };
    img.src = URL.createObjectURL(file);
  });
}

// 上传头像并更新 Firestore 和 photoURL
export async function uploadAvatar(showMsgId) {
  const user = auth.currentUser;
  if (!user || !selectedFile) {
    alert("请先登录并选择一张图片！");
    return;
  }

  const now = new Date();
  const createTime = new Date(user.metadata.creationTime);
  const diffSinceReg = (now - createTime) / (1000 * 3600 * 24);
  if (diffSinceReg < 2) {
    return showMsg(showMsgId, "注册两天内不可更换头像", "red");
  }
  if (lastAvatarChange && (now - lastAvatarChange.toDate()) < 3 * 24 * 3600 * 1000) {
    return showMsg(showMsgId, "头像更改需间隔3天", "red");
  }

  const ref = storage.ref(`avatars/${user.uid}.jpg`);
  await ref.put(selectedFile);
  const url = await ref.getDownloadURL();

  await user.updateProfile({ photoURL: url });
  await db.collection("profiles").doc(user.uid).set({
    avatar: url,
    avatarUpdateTime: now
  }, { merge: true });

  showMsg(showMsgId, "头像设置成功！", "green");
  setTimeout(() => location.reload(), 1500);
}

// 保存用户名
export async function saveUsername(inputId, showMsgId) {
  const user = auth.currentUser;
  if (!user) return alert("请先登录");

  const name = document.getElementById(inputId).value.trim();
  if (!name) return showMsg(showMsgId, "用户名不能为空", "red");
  if (name.length > 16) return showMsg(showMsgId, "用户名不能超过16个字符", "red");

  const now = new Date();
  if (lastNameChange && (now - lastNameChange.toDate()) < 3 * 24 * 3600 * 1000) {
    return showMsg(showMsgId, "用户名更改需间隔3天", "red");
  }

  if (name === user.displayName) {
    return showMsg(showMsgId, "没有任何修改", "gray");
  }

  await user.updateProfile({ displayName: name });
  await db.collection("profiles").doc(user.uid).set({
    displayName: name,
    nameUpdateTime: now
  }, { merge: true });

  showMsg(showMsgId, "用户名修改成功", "green");
}

// 显示消息提示
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.innerText = text;
  el.className = `msg-success ${type}`;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2500);
}

// 初始化用户信息（头像、用户名、限制时间）
export async function initProfilePage({ emailId, avatarImgId, usernameInputId }) {
  auth.onAuthStateChanged(async user => {
    if (!user) return location.href = "login.html";

    document.getElementById(emailId).innerText = "登录邮箱：" + user.email;
    document.getElementById(usernameInputId).value = user.displayName || "";

    if (user.photoURL) {
      document.getElementById(avatarImgId).src = user.photoURL;
    }

    const doc = await db.collection("profiles").doc(user.uid).get();
    if (doc.exists) {
      const data = doc.data();
      lastAvatarChange = data.avatarUpdateTime || null;
      lastNameChange = data.nameUpdateTime || null;
    }
  });
}
