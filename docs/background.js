window.chrome.app.runtime.onLaunched.addListener(() => {
  window.chrome.app.window.create('index.html', {
    bounds: { width: 1280, height: 720 }
  })
})
