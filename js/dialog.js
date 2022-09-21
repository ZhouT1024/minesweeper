const dialog = (function () {
  // 遮罩
  const mask = document.getElementById('dialog-mask')
  // 表单输入框
  const widthInput = document.querySelector('.input.width')
  const heightInput = document.querySelector('.input.height')
  const mineInput = document.querySelector('.input.mine')
  // 按钮
  const confirmBtn = document.querySelector('.btn.confirm')
  const closeBtn = document.querySelector('.btn.close')
  const cancelBtn = document.querySelector('.btn.cancel')

  // 打开弹窗
  function openDialog() {
    mask.style.display = 'block'
    return new Promise(resolve => {
      // 提交
      confirmBtn.onclick = function (e) {
        // 24*30
        let width = widthInput.value
        let height = heightInput.value
        let mine = mineInput.value
        if (width < 0 || width > 30) {
          alert('宽度范围为0~30')
          return
        }
        if (height < 0 || height > 24) {
          alert('高度范围为0~24')
          return
        }
        if (mine >= width * height) {
          alert('地雷太多了')
          return
        }
        mask.style.display = 'none'
        resolve({
          width: width,
          height: height,
          mine: mine
        })
      }

      // 关闭弹窗
      // 关闭弹窗
      function closeDialog(e) {
        mask.style.display = 'none'
        widthInput.value = ''
        heightInput.value = ''
        mineInput.value = ''
        resolve({ width: 9, height: 9, mine: 10 })
      }
      closeBtn.onclick = closeDialog
      cancelBtn.onclick = closeDialog
    })
  }
  return { openDialog }
})()
