const CACHE_NAME = 'xiaozhang-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-72x72.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-splash-512x512.png',
  './apple-touch-icon.png'
];

// 安装：缓存核心文件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求：网络优先，离线回退缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功获取网络响应后，顺便更新缓存
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
