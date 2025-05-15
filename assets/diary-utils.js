export function toggleExpand(id) {
  const content = document.getElementById(`content-${id}`);
  const btn = document.getElementById(`expand-btn-${id}`);
  if (!content || !btn) return;

  content.classList.toggle('collapsed');
  btn.innerText = content.classList.contains('collapsed') ? '展开全文' : '收起全文';
}

export function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  const btn = document.getElementById(`toggle-btn-${id}`);
  if (!box || !btn) return;

  const showing = getComputedStyle(box).display === 'block';
  box.style.display = showing ? 'none' : 'block';
  btn.innerText = showing ? '点击查看与发表评论' : '点击收起';
}

// ✅ 新增统一绑定函数：加载后一次性绑定所有按钮事件
export function setupToggleListeners() {
  document.querySelectorAll('[data-toggle-expand]').forEach(btn => {
    const id = btn.getAttribute('data-id');
    btn.addEventListener('click', () => toggleExpand(id));
  });

  document.querySelectorAll('[data-toggle-comments]').forEach(btn => {
    const id = btn.getAttribute('data-id');
    btn.addEventListener('click', () => toggleComments(id));
  });
}
