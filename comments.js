document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  const auth = firebase.auth();

  window.initCommentSystem = function ({ postId, containerId }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const commentBox = document.createElement('div');
    commentBox.innerHTML = `
      <div style="margin-bottom: 10px;">
        <button onclick="setSort('${postId}', 'likes')">按点赞数排序</button>
        <button onclick="setSort('${postId}', 'time')">按时间排序</button>
      </div>
      <div class="comments-list" id="list-${postId}">加载中...</div>
      <div class="comment-form">
        <textarea id="input-${postId}" placeholder="写点什么吧～"></textarea>
        <button onclick="submitComment('${postId}')">发送评论</button>
        <p class="success-msg" id="feedback-${postId}" style="color:green;display:none;">评论成功！</p>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(commentBox);

    window.commentSortBy = window.commentSortBy || {};
    window.commentSortBy[postId] = 'time';
    loadComments(postId);
  };

  window.setSort = function (postId, method) {
    window.commentSortBy[postId] = method;
    loadComments(postId);
  };

  window.submitComment = function (postId, replyTo = null) {
    const user = auth.currentUser;
    const input = document.getElementById(`input-${postId}`);
    const feedback = document.getElementById(`feedback-${postId}`);
    const text = input.value.trim();
    if (!user) return showFeedback(feedback, "您尚未登录", "red");
    if (!text) return;

    db.collection("profiles").doc(user.uid).get().then(doc => {
      const username = doc.exists ? doc.data().displayName : user.displayName;
      if (!username || username.trim() === "") return showFeedback(feedback, "您未设置用户名", "red");

      const content = replyTo ? `回复 @${replyTo.name}：${text}` : text;

      db.collection("diary-comments")
        .doc(postId)
        .collection("items")
        .add({
          user: username,
          uid: user.uid,
          avatar: doc.exists && doc.data().avatar || "assets/avatar.png",
          text: content,
          time: new Date(),
          like: [],
          dislike: [],
          replyTo: replyTo ? replyTo.id : null,
        })
        .then(() => {
          input.value = "";
          showFeedback(feedback, "评论成功！", "green");
          loadComments(postId);
        });
    });
  };

  function showFeedback(el, msg, color) {
    el.innerText = msg;
    el.style.color = color;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 2000);
  }

  window.replyToComment = function (postId, commentId, username) {
    const input = document.getElementById(`input-${postId}`);
    input.value = `回复 @${username}：`;
    input.focus();
    window.replyTarget = { id: commentId, name: username };
  }

  window.toggleLike = function (postId, commentId, type) {
    const user = auth.currentUser;
    if (!user) return alert("请先登录");

    const ref = db.collection("diary-comments").doc(postId).collection("items").doc(commentId);
    ref.get().then(doc => {
      if (!doc.exists) return;
      const data = doc.data();
      const uid = user.uid;

      const likeSet = new Set(data.like || []);
      const dislikeSet = new Set(data.dislike || []);

      if (type === "like") {
        if (likeSet.has(uid)) likeSet.delete(uid);
        else {
          likeSet.add(uid);
          dislikeSet.delete(uid);
        }
      } else {
        if (dislikeSet.has(uid)) dislikeSet.delete(uid);
        else {
          dislikeSet.add(uid);
          likeSet.delete(uid);
        }
      }

      ref.update({
        like: Array.from(likeSet),
        dislike: Array.from(dislikeSet)
      }).then(() => loadComments(postId));
    });
  }

  function loadComments(postId) {
    const list = document.getElementById(`list-${postId}`);
    list.innerHTML = "加载中...";

    db.collection("diary-comments").doc(postId).collection("items").get().then(snap => {
      const items = [];
      snap.forEach(doc => {
        const data = doc.data();
        data.id = doc.id;
        items.push(data);
      });

      // 排序
      const sort = window.commentSortBy[postId] || 'time';
      items.sort((a, b) => {
        if (sort === 'likes') {
          const aLike = (a.like || []).length;
          const bLike = (b.like || []).length;
          if (bLike !== aLike) return bLike - aLike;
          return b.time.toDate() - a.time.toDate(); // 新的在前
        } else {
          const ta = a.time.toDate();
          const tb = b.time.toDate();
          if (tb.getTime() !== ta.getTime()) return tb - ta;
          return (b.like || []).length - (a.like || []).length;
        }
      });

      // 楼中楼结构
      const topLevel = items.filter(i => !i.replyTo);
      const childrenMap = {};
      items.forEach(i => {
        if (i.replyTo) {
          if (!childrenMap[i.replyTo]) childrenMap[i.replyTo] = [];
          childrenMap[i.replyTo].push(i);
        }
      });

      list.innerHTML = topLevel.map(i => renderComment(i, childrenMap[i.id] || [], postId)).join('');
    });
  }

  function renderComment(comment, replies, postId) {
    const likeCount = (comment.like || []).length;
    const dislikeCount = (comment.dislike || []).length;
    return `
      <div class="comment" style="margin-bottom: 10px; padding: 8px; border-bottom: 1px solid #ccc;">
        <img src="${comment.avatar}" style="width:30px;height:30px;border-radius:50%;vertical-align:middle;" />
        <b style="margin-left:8px;">${comment.user}</b>
        <p style="margin:5px 0;">${comment.text}</p>
        <div style="font-size:13px;color:#666;">
          ${comment.time.toDate().toLocaleString()}
          <span style="margin-left:15px;cursor:pointer;" onclick="replyToComment('${postId}', '${comment.id}', '${comment.user}')">回复</span>
          <span style="margin-left:15px;cursor:pointer;" onclick="toggleLike('${postId}', '${comment.id}', 'like')">👍 ${likeCount}</span>
          <span style="margin-left:10px;cursor:pointer;" onclick="toggleLike('${postId}', '${comment.id}', 'dislike')">👎 ${dislikeCount}</span>
        </div>
        <div style="margin-left:20px; margin-top:6px;">
          ${replies.map(r => `
            <div style="margin-bottom:5px;">
              <img src="${r.avatar}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;" />
              <b style="margin-left:6px;">${r.user}</b>：${r.text}
              <span style="font-size:12px;color:#666;margin-left:10px;">${r.time.toDate().toLocaleString()}</span>
              <span style="margin-left:10px;cursor:pointer;font-size:12px;" onclick="replyToComment('${postId}', '${r.id}', '${r.user}')">回复</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
});
