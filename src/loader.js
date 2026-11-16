function showBootstrapError(error) {
  console.error('啟動地城圖鑑失敗', error);
  const title = document.getElementById('collection-title');
  if (title) title.textContent = '無法載入圖鑑程式';
  const details = document.getElementById('details');
  if (!details) return;

  const message = document.createElement('p');
  message.className = 'detail-error';
  message.setAttribute('role', 'alert');
  message.textContent = '請重新建置 dist 後再開啟圖鑑。';
  details.replaceChildren(message);
}

if (location.protocol === 'file:') {
  const bundlePaths = ['./src/file-app.js', './dist/src/file-app.js'];
  let nextBundlePath = 0;
  const loadFileBundle = () => {
    const script = document.createElement('script');
    script.src = bundlePaths[nextBundlePath++];
    script.onerror = () => {
      if (nextBundlePath < bundlePaths.length) {
        loadFileBundle();
        return;
      }
      showBootstrapError(new Error('找不到離線圖鑑 bundle，請先執行 npm run build。'));
    };
    document.head.append(script);
  };
  loadFileBundle();
} else {
  import('./wiki.js').catch(showBootstrapError);
}
